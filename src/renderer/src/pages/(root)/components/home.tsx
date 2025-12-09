'use client';

import { useState } from 'react';
import { CronListView } from './cron-list-view';
import { CronDetailView } from './cron-detail-view';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
    const [selectedCronId, setSelectedCronId] = useState<string | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    return (
        <main className="min-h-screen bg-background text-foreground">
            <AnimatePresence mode="wait">
                {selectedCronId === null ? (
                    <motion.div
                        key="list"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                    >
                        <CronListView onSelectCron={setSelectedCronId} refreshTrigger={refreshTrigger} />
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
    );
}
