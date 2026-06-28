import { useState } from 'react';

import TabSwitcher from './TabSwitcher';
import OverviewTab from './OverviewTab';
import FilesTab from './FilesTab';
import ModulesTab from './ModulesTab';
import EmptyState from './EmptyState';

/**
 * MainPanel - Renders the dashboard content area.
 *
 * @param {object|null} props.selectedRun - Currently active run (null = show empty state)
 * @param {boolean}     props.loading
 * @param {string|null} props.error
 */
export default function MainPanel({
  selectedRun,
  loading,
  error,
  activeTab,
  navigatedFile,
  onTabSwitch,
  onNavigateFile,
}) {

  if (loading) {
    return (
      <main className="flex-1 overflow-y-auto p-10">
        <div className="spinner mt-24" />
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex-1 overflow-y-auto p-10">
        <EmptyState
          message={error}
          variant="error"
        />
      </main>
    );
  }

  if (!selectedRun) {
    return (
      <main className="flex-1 overflow-y-auto p-10">
        <EmptyState />
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto p-10 flex flex-col gap-8">
      {/* Tabs */}
      <div className="flex flex-col gap-6">
        <TabSwitcher activeTab={activeTab} onSwitch={onTabSwitch} />

        {activeTab === 'overview' ? (
          <OverviewTab
            components={selectedRun.components ?? []}
            onNavigateFile={onNavigateFile}
          />
        ) : activeTab === 'files' ? (
          <FilesTab
            selectedRun={selectedRun}
            initialFile={navigatedFile}
          />
        ) : (
          <ModulesTab
            selectedRun={selectedRun}
          />
        )}
      </div>
    </main>
  );
}
