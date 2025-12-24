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
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function Page({}) {
  const router = useRouter();
  const { isInstalled } = usePWAStatus({ redirectToInstall: false });

  useEffect(() => {
    if (!isInstalled) {
      router.replace("/install");
    }
  }, [isInstalled, router]);
  const supabase = createClient();
  const params = useParams<{ id: string }>();
  const [reminderData, setReminderData] = useState({
    title: "",
    description: "",
    priority: "low",
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

  useEffect(() => {
    const fetchReminder = async () => {
      const { data, error } = await supabase
        .from("reminders")
        .select("*")
        .eq("id", params.id)
        .single();

      if (error) {
        toast.error("Failed to fetch reminder data.");
        return;
      }

      if (data) {
        setReminderData({
          title: data.title,
          description: data.description,
          priority: data.priority,
        });
        console.log("Fetched reminder data:", data);
        return;
      }
      toast.error("Reminder not found.");
    };
    fetchReminder();
  }, [params.id, supabase]);

  const handleSubmit = async () => {
    if (!reminderData.title || reminderData.title.trim() === "") {
      console.log(reminderData);
      toast.error("Please enter a title for the reminder.");
      return;
    }

    const { error } = await supabase
      .from("reminders")
      .update([reminderData])
      .eq("id", params.id);

    if (error) {
      toast.error("Failed to save reminder. Please try again.");
      return;
    }

    toast.success("Reminder saved successfully!");
    router.push(`/`);
  };

  const handleDelete = async () => {
    const { error } = await supabase
      .from("reminders")
      .delete()
      .eq("id", params.id);

    if (error) {
      toast.error("Failed to delete reminder. Please try again.");
      return;
    }

    toast.success("Reminder deleted successfully!");
    router.push(`/`);
  };

  return (
    <main className="max-w-3xl mx-auto px-3 min-h-[90vh] pt-21">
      <section>
        <Button className="mb-10" onClick={() => history.back()}>
          <ArrowLeft /> Back
        </Button>
      </section>
      <section className="w-full text-start mb-12">
        <h2 className="text-3xl font-black text-primary">Edit Reminder</h2>
      </section>
      <section>
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
        <div>
          <Button onClick={() => handleSubmit()} className="mt-4">
            Save Reminder
          </Button>
        </div>
      </section>
      <section className="mt-21 bg-accent p-4 rounded-md flex flex-col justify-center items-center">
        <Label className="text-center mb-4">
          Delete this reminder permanently.
        </Label>
        <Button
          className="bg-red-500 hover:bg-red-600"
          onClick={() => handleDelete()}
        >
          Delete Reminder
        </Button>
      </section>
    </main>
  );
}
