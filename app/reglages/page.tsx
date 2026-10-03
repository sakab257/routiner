"use client";

import { ChevronRight, Download, Moon, Trash2, Upload, Vibrate, Volume2, type LucideIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { toast } from "sonner";
import { InstallCard } from "@/components/install-card";
import { Card, FieldLabel, Screen, Segmented } from "@/components/kit";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { useToday } from "@/hooks/use-today";
import { createBackup, parseBackup } from "@/lib/data";
import { feedback } from "@/lib/feedback";
import type { AppData, ThemePreference } from "@/lib/schema";
import { pickData, useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

function IconTile({ icon: Icon, danger }: { icon: LucideIcon; danger?: boolean }) {
  return (
    <span
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-[10px]",
        danger ? "bg-fail-soft text-fail-ink" : "bg-soft text-accent-ink",
      )}
    >
      <Icon className="size-5" />
    </span>
  );
}

function ActionRow({ icon, title, sub, onClick, danger, last }: {
  icon: LucideIcon;
  title: string;
  sub: string;
  onClick: () => void;
  danger?: boolean;
  last?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn("flex min-h-16 w-full items-center gap-3 text-left", !last && "border-b border-line")}
    >
      <IconTile icon={icon} danger={danger} />
      <span className="flex flex-1 flex-col">
        <span className={cn("text-base", danger ? "font-semibold text-fail-ink" : "font-medium")}>{title}</span>
        <span className="text-xs text-ink-60">{sub}</span>
      </span>
      {!danger && <ChevronRight className="size-5.5 text-ink-60" />}
    </button>
  );
}

function ToggleRow({ icon, label, hint, checked, onChange, disabled, last }: {
  icon: LucideIcon;
  label: string;
  hint?: ReactNode;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  last?: boolean;
}) {
  return (
    <label className={cn("flex min-h-15 items-center gap-3", !last && "border-b border-line")}>
      <IconTile icon={icon} />
      <span className="flex flex-1 flex-col">
        <span className="text-base font-medium">{label}</span>
        {hint && <span className="text-xs text-ink-60">{hint}</span>}
      </span>
      <Switch checked={checked} onCheckedChange={onChange} disabled={disabled} aria-label={label} />
    </label>
  );
}

const canVibrate = () => typeof navigator !== "undefined" && "vibrate" in navigator;

function summary(data: AppData) {
  const days = new Set(Object.values(data.logs).flatMap((d) => Object.keys(d))).size;
  return `${data.habits.length} habitude${data.habits.length > 1 ? "s" : ""}, ${data.challenges.length} défi${data.challenges.length > 1 ? "s" : ""} et ${days} jour${days > 1 ? "s" : ""} d'historique`;
}

export default function SettingsPage() {
  const router = useRouter();
  const today = useToday();
  const settings = useAppStore((s) => s.settings);
  const updateSettings = useAppStore((s) => s.updateSettings);
  const replaceData = useAppStore((s) => s.replaceData);
  const resetAll = useAppStore((s) => s.resetAll);
  const vibrationSupported = useSyncExternalStore(() => () => {}, canVibrate, () => true);
  const fileInput = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<AppData | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const fileName = `routiner-${today}.json`;

  const exportData = () => {
    const backup = createBackup(pickData(useAppStore.getState()));
    const url = URL.createObjectURL(new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" }));
    const link = Object.assign(document.createElement("a"), { href: url, download: fileName });
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast.success("Sauvegarde exportée");
  };

  const readFile = async (file: File | undefined) => {
    if (!file) return;
    const result = parseBackup(await file.text());
    if (fileInput.current) fileInput.current.value = "";
    if (!result.ok) {
      toast.error(result.error);
      feedback("fail");
      return;
    }
    setPending(result.data);
  };

  return (
    <Screen withNav className="gap-2">
      <h1 className="mb-2.5 text-2xl font-bold tracking-[-0.3px]">Réglages</h1>

      <FieldLabel>Apparence</FieldLabel>
      <Card className="flex flex-col gap-3 p-3.5">
        <div className="flex items-center gap-3">
          <IconTile icon={Moon} />
          <span className="text-base font-medium">Thème</span>
        </div>
        <Segmented<ThemePreference>
          label="Thème"
          value={settings.theme}
          onChange={(theme) => updateSettings({ theme })}
          options={[
            { value: "light", label: "Clair" },
            { value: "dark", label: "Sombre" },
            { value: "system", label: "Auto" },
          ]}
        />
      </Card>

      <FieldLabel className="mt-3">Retours</FieldLabel>
      <Card className="flex flex-col px-3.5">
        <ToggleRow
          icon={Volume2}
          label="Sons"
          checked={settings.sounds}
          onChange={(sounds) => {
            updateSettings({ sounds });
            if (sounds) feedback("tap");
          }}
        />
        <ToggleRow
          icon={Vibrate}
          label="Vibrations"
          hint={vibrationSupported ? undefined : "Non pris en charge par ce navigateur"}
          checked={settings.vibrations && vibrationSupported}
          disabled={!vibrationSupported}
          onChange={(vibrations) => {
            updateSettings({ vibrations });
            if (vibrations) navigator.vibrate?.(15);
          }}
          last
        />
      </Card>

      <FieldLabel className="mt-3">Données</FieldLabel>
      <Card className="flex flex-col px-3.5">
        <ActionRow icon={Upload} title="Exporter en JSON" sub={fileName} onClick={exportData} />
        <ActionRow
          icon={Download}
          title="Importer un JSON"
          sub="Remplace les données actuelles"
          onClick={() => fileInput.current?.click()}
          last
        />
        <input
          ref={fileInput}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => void readFile(e.target.files?.[0])}
        />
      </Card>

      <Card className="mt-3 px-3.5">
        <ActionRow
          icon={Trash2}
          title="Réinitialiser l'app"
          sub="Efface habitudes, défis et historique"
          onClick={() => setConfirmReset(true)}
          danger
          last
        />
      </Card>

      <InstallCard />

      <p className="mt-3 text-center text-xs text-ink-60">Routiner 1.0 · données stockées sur cet appareil</p>

      <AlertDialog open={pending !== null} onOpenChange={(open) => !open && setPending(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remplacer tes données ?</AlertDialogTitle>
            <AlertDialogDescription>
              La sauvegarde contient {pending && summary(pending)}. Tes données actuelles seront remplacées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!pending) return;
                replaceData({ ...pending, onboarded: true });
                setPending(null);
                toast.success("Données importées");
                feedback("done");
              }}
            >
              Importer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmReset} onOpenChange={setConfirmReset}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tout effacer ?</AlertDialogTitle>
            <AlertDialogDescription>
              Habitudes, défis, humeurs et historique seront supprimés de cet appareil. Exporte une sauvegarde avant si tu
              veux pouvoir revenir en arrière.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                resetAll();
                router.replace("/bienvenue");
              }}
            >
              Tout effacer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Screen>
  );
}
