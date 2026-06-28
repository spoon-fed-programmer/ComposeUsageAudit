import { useState } from 'react';

import TabSwitcher from './TabSwitcher';
import OverviewTab from './OverviewTab';
import FilesTab from './FilesTab';
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
  setActiveTab,
  navigatedFile,
  setNavigatedFile,
}) {

  /** Called from ComponentsTable when a component link is clicked. */
  const handleNavigateFile = (fileName) => {
    setNavigatedFile(fileName);
    setActiveTab('files');
  };

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    if (tab === 'overview') setNavigatedFile(null);
  };

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
        <TabSwitcher activeTab={activeTab} onSwitch={handleTabSwitch} />

        {activeTab === 'overview' ? (
          <OverviewTab
            components={selectedRun.components ?? []}
            onNavigateFile={handleNavigateFile}
          />
        ) : (
          <FilesTab
            selectedRun={selectedRun}
            initialFile={navigatedFile}
          />
        )}
      </div>
    </main>
  );
}
