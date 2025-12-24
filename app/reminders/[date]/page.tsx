"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { usePWAStatus } from "@/utils/CheckPWA";
import { createClient } from "@/utils/supabase/client";
import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export default function Page({}) {
  const supabase = createClient();
  const router = useRouter();
  const { isInstalled } = usePWAStatus({ redirectToInstall: false });

  useEffect(() => {
    if (!isInstalled) {
      router.replace("/install");
    }
  }, [isInstalled, router]);

  const params = useParams<{ date: string }>();
  const parsedDate = useMemo(
    () => new Date(decodeURIComponent(params.date)),
    [params.date]
  );
  const [reminderData, setReminderData] = useState({
    title: "",
    description: "",
    priority: "low",
    month: parsedDate.getMonth() + 1,
    day: parsedDate.getDate(),
    year: parsedDate.getFullYear(),
    email: "",
  });

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user?.email) {
        setReminderData((prev) => ({ ...prev, email: user.email ?? "" }));
      }
      console.log(user);
    };
    fetchUser();
  }, [supabase]);

  const handleSubmit = async () => {
    if (!reminderData.title || reminderData.title.trim() === "") {
      console.log(reminderData);
      toast.error("Please enter a title for the reminder.");
      return;
    }

    const { error } = await supabase.from("reminders").insert([reminderData]);

    if (error) {
      toast.error("Failed to save reminder. Please try again.");
      return;
    }

    toast.success("Reminder saved successfully!");
    setReminderData((prev) => ({ ...prev, title: "", description: "" }));
    router.push(`/`);
  };

  return (
    <main className="max-w-3xl mx-auto px-3 min-h-[90vh] pt-21">
      <section className="w-full">
        <Button className="mb-10" onClick={() => history.back()}>
          <ArrowLeft /> Back
        </Button>
      </section>
      <section className="w-full text-start mb-21">
        <h2 className="text-lg font-bold text-primary">Add Reminder for</h2>
        <span className="font-black text-4xl">
          {parsedDate.toLocaleString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </span>
      </section>
      <section className="w-full">
        <div className="mb-5">
          <Label htmlFor="reminder_title">Reminder Title*</Label>
          <Input
            type="text"
            id="reminder_title"
            className="mt-2"
            value={reminderData.title}
            onChange={(e) =>
              setReminderData({ ...reminderData, title: e.target.value })
            }
          />
        </div>
        <div className="mb-5">
          <Label htmlFor="reminder_description">Reminder Description</Label>
          <Textarea
            id="reminder_description"
            className="mt-2"
            value={reminderData.description}
            onChange={(e) =>
              setReminderData({ ...reminderData, description: e.target.value })
            }
          />
        </div>
        <div className="mb-5">
          <Label htmlFor="reminder_priority" className="mb-2">
            Reminder Priority*
          </Label>
          <Select
            value={reminderData.priority}
            onValueChange={(value) =>
              setReminderData({ ...reminderData, priority: value })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Priority</SelectLabel>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => handleSubmit()} className="mt-4">
          Save Reminder
        </Button>
      </section>
    </main>
  );
}
