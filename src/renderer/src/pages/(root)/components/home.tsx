'use client';

import { useState } from 'react';
import { CronListView } from './cron-list-view';
import { CronDetailView } from './cron-detail-view';
import { motion, AnimatePresence } from 'framer-motion';
import { CronConfig } from '@/lib/schemas';
import { CreateCronModal } from './create-cron-modal';

export default function Home() {
    const [selectedCronId, setSelectedCronId] = useState<string | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

    const handleCreateCron = (data: Omit<CronConfig, "id" | "createdAt" | "updatedAt">) => {
        console.log("Modal submit recibido:", data)
        setRefreshTrigger((prev) => prev + 1)
    }

    return (
        <>
        <main className="min-h-screen bg-transparent backdrop-blur-sm rounded-xl border">
            <AnimatePresence mode="wait">
                {selectedCronId === null ? (
                    <motion.div
                        key="list"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                    >
                        <CronListView
                            onSelectCron={setSelectedCronId}
                            refreshTrigger={refreshTrigger}
                            onCreateCron={() => setIsCreateModalOpen(true)}
                        />
                    </motion.div>
                ) : (
                    <motion.div
                        key="detail"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                    >
                        <CronDetailView
                            cronId={selectedCronId}
                            onBack={() => setSelectedCronId(null)}
                            onSave={() => setRefreshTrigger((prev) => prev + 1)}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
        <CreateCronModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onSubmit={handleCreateCron}
        />
        </>
    );
}
