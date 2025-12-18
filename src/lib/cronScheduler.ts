import cron from "node-cron"
import { cronRegistry } from "@app/main/services/CronRegistry"
import type { CronWithSteps } from "@app/types/crone.types"

let cronExecutor: any = null

export function setCronExecutor(executor: any): void {
  cronExecutor = executor
}

export function scheduleCron(cronConfig: CronWithSteps): void {
  if (!cronConfig.isActive) {
    console.log(`[CronScheduler] Cron not active, skipping: ${cronConfig.name}`)
    return
  }

  if (cronRegistry.has(cronConfig.id)) {
    console.log(`[CronScheduler] Cron already scheduled, rescheduling: ${cronConfig.name}`)
    unscheduleCron(cronConfig.id)
  }

  const task = cron.schedule(
    cronConfig.cronExpression,
    async () => {
      const now = Date.now()

      if (cronConfig.startAt && now < cronConfig.startAt) {
        console.log(`[CronScheduler] Cron not started yet: ${cronConfig.name}`)
        return
      }

      if (cronConfig.endAt && now > cronConfig.endAt) {
        console.log(`[CronScheduler] Cron expired, stopping: ${cronConfig.name}`)
        unscheduleCron(cronConfig.id)
        return
      }

      if (cronExecutor) {
        await cronExecutor.execute(cronConfig)
      } else {
        console.error("[CronScheduler] CronExecutor not set!")
      }
    },
    {
      timezone: cronConfig.timezone || "America/New_York",
    },
  )

  cronRegistry.register(cronConfig.id, task)
  console.log(`[CronScheduler] Scheduled: ${cronConfig.name}`)
}

export function unscheduleCron(cronId: string): void {
  cronRegistry.stop(cronId)
}

export function unscheduleAllCrons(): void {
  cronRegistry.stopAll()
}
