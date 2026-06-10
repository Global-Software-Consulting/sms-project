'use client';

import { useCallback, useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  getGroupedSettings,
  bulkUpdateSettings,
  type SystemSetting,
} from '@/lib/api/settingsApi';
import {
  PAGE_EDITOR_PAGES,
  buildKey,
  pageKeys,
  type EditablePage,
  type PageEditField,
} from '@/lib/page-editor-config';

/**
 * Page Editor — config-driven form that lets admins edit every field on
 * every public-facing page from a single place. Replaces the old
 * hardcoded Banner + SEO panel and the standalone Legal Management
 * page.
 *
 * All values round-trip through the existing system_settings table via
 * the existing settingsApi (group="page"). No schema change.
 */
export function PageEditor() {
  const [activeSlug, setActiveSlug] = useState<string>(
    PAGE_EDITOR_PAGES[0]?.slug ?? 'home',
  );
  // values is keyed by the full settings key (page_<slug>_<section>_<field>)
  const [values, setValues] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const activePage: EditablePage | undefined = PAGE_EDITOR_PAGES.find(
    (p) => p.slug === activeSlug,
  );

  /** Load the "page" group once on mount — the group name in
   *  system_settings matches the storage key prefix. We rely on the
   *  backend grouping by the prefix before the first `_`. */
  const fetchAll = useCallback(async () => {
    try {
      setIsLoading(true);
      const grouped = await getGroupedSettings();
      // The `page` group contains every page_* key.
      const rows: SystemSetting[] = (grouped['page'] as SystemSetting[]) || [];
      const next: Record<string, string> = {};
      rows.forEach((s) => {
        next[s.key] = s.value;
      });
      setValues(next);
    } catch (err) {
      console.error('Failed to load page content:', err);
      toast.error('Failed to load page content');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const setField = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!activePage) return;
    setIsSaving(true);
    try {
      const allKeys = pageKeys(activePage);
      const updates = allKeys.map((key) => ({
        key,
        value: values[key] ?? '',
      }));
      await bulkUpdateSettings({ settings: updates });
      toast.success(`${activePage.label} content saved`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  const renderField = (
    field: PageEditField,
    sectionKey: string,
  ): React.ReactNode => {
    if (!activePage) return null;
    const fullKey = buildKey(activePage.slug, sectionKey, field.key);
    const value = values[fullKey] ?? field.defaultValue ?? '';
    const common =
      'w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-base lg:text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]';

    return (
      <div key={fullKey}>
        <label className="mb-2 block text-sm font-medium text-white">
          {field.label}
        </label>
        {field.type === 'textarea' || field.type === 'rich' ? (
          <textarea
            value={value}
            onChange={(e) => setField(fullKey, e.target.value)}
            rows={field.rows ?? 3}
            placeholder={field.placeholder}
            className={`${common} resize-y`}
          />
        ) : (
          <input
            type={field.type === 'url' ? 'url' : 'text'}
            value={value}
            onChange={(e) => setField(fullKey, e.target.value)}
            placeholder={field.placeholder}
            className={common}
          />
        )}
        {field.help && (
          <p className="mt-1 text-xs text-[#64748B]">{field.help}</p>
        )}
      </div>
    );
  };

  if (!activePage) return null;

  return (
    <div className="max-w-5xl">
      {/* Page header */}
      <div className="mb-6 rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(15,23,42,0.6)] p-4 backdrop-blur-xl sm:p-8">
        <h2 className="mb-2 text-2xl font-semibold text-white">Page Edit</h2>
        <p className="text-sm text-[#94A3B8]">
          Edit every section of every public-facing page from one place. Saves
          to the live site immediately.
        </p>
      </div>

      {/* Page picker */}
      <div className="mb-6 rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(15,23,42,0.6)] p-4 backdrop-blur-xl sm:p-6">
        <h3 className="mb-3 text-sm font-medium text-[#94A3B8]">
          Choose a page
        </h3>
        <div className="flex flex-wrap gap-2">
          {PAGE_EDITOR_PAGES.map((p) => (
            <button
              key={p.slug}
              onClick={() => setActiveSlug(p.slug)}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                activeSlug === p.slug
                  ? 'bg-[#3B82F6] text-white'
                  : 'bg-[rgba(255,255,255,0.08)] text-white hover:bg-[rgba(255,255,255,0.12)]'
              }`}
            >
              {p.label}
              {p.path && (
                <span className="ml-2 text-xs opacity-60">{p.path}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#3B82F6]" />
        </div>
      ) : (
        <>
          {activePage.sections.map((section) => (
            <div
              key={`${activePage.slug}-${section.key}`}
              className="mb-6 rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(15,23,42,0.6)] p-4 backdrop-blur-xl sm:p-8"
            >
              <h3 className="mb-1 text-lg font-semibold text-white">
                {section.title}
              </h3>
              {section.description && (
                <p className="mb-4 text-sm text-[#94A3B8]">
                  {section.description}
                </p>
              )}
              <div className="space-y-4">
                {section.fields.map((f) => renderField(f, section.key))}
              </div>
            </div>
          ))}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end sm:gap-4">
            <button
              onClick={fetchAll}
              disabled={isSaving}
              className="flex w-full items-center justify-center rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.08)] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[rgba(255,255,255,0.12)] disabled:opacity-50 sm:w-auto sm:justify-start"
            >
              Reset
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#3B82F6] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#2563EB] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:justify-start"
            >
              {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSaving ? 'Saving...' : `Save ${activePage.label}`}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
