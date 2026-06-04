'use client';

interface ToggleSwitchProps {
  label: string;
  name: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: string;
}

export function AdminToggleSwitch({
  label,
  name,
  checked,
  onChange,
  description,
}: ToggleSwitchProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <label className="block text-sm font-medium text-white">{label}</label>
        {description && (
          <p className="mt-1 text-xs text-[#64748B]">{description}</p>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`size-icon relative inline-flex h-6 w-11 items-center rounded-full !p-0 transition-colors ${checked ? 'bg-[#3B82F6]' : 'bg-[#64748B]'}`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`}
        />
      </button>
    </div>
  );
}
