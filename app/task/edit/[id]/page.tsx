"use client";

import LoadingIcon from "@/components/loading-icon";
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
import { createClient } from "@/utils/supabase/client";
import { ArrowLeft, ChevronDownIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Task } from "@/types/task.type";
import * as z from "zod";
import { activities } from "@/data/activities";

const TaskSchema = z.object({
  id: z.number().min(1),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  startTime: z.string().min(1, "Start time is required"),
  priority: z.enum(["low", "medium", "high"]),
  activity: z.string().min(1, "Activity is required"),
  status: z.enum(["pending", "shift", "done"]),
  month: z.number().min(1).max(12),
  day: z.number().min(1).max(31),
  year: z.number().min(1900),
  email: z.string().email(),
});

export default function Page({}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const params = useParams<{ id: string }>();
  const currentYear = Number(process.env.NEXT_PUBLIC_CALENDAR_YEAR);

  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());

  const [taskData, setReminderData] = useState<Task>({
    id: 0,
    title: "",
    description: "",
    priority: "low",
    month: 1,
    day: 1,
    year: currentYear,
    email: "",
    created_at: "",
    activity: "",
    startTime: "",
    status: "pending",
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
      setLoading(true);
      const { data, error } = await supabase
        .from("dayPlans")
        .select("*")
        .eq("id", params.id)
        .single();

      if (error) {
        toast.error("Failed to fetch reminder data.");
        return;
      }

      if (data) {
        setReminderData(() => ({
          ...data,
        }));
        setLoading(false);
        console.log("Fetched reminder data:", data);
        return;
      }
      setLoading(false);
      toast.error("Reminder not found.");
    };
    fetchReminder();
  }, [params.id, supabase]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const result = TaskSchema.safeParse(taskData);
      if (!result.success) {
        const pretty = z.prettifyError(result.error);
        toast.error(`${pretty}`);
        setLoading(false);
        return;
      } else {
        const { error } = await supabase
          .from("dayPlans")
          .update([result.data])
          .eq("id", params.id);

        if (error) {
          toast.error("Failed to save reminder. Please try again.");
          setLoading(false);
          return;
        }

        if (taskData.status === "shift") {
          if (!date) {
            toast.error("Please select a date to shift the reminder.");
            setLoading(false);
            return;
          }

          const day = date.getDate();
          const month = date.getMonth() + 1;
          const year = date.getFullYear();

          const { id, ...dataWithoutId } = result.data;

          const { error } = await supabase.from("dayPlans").insert([
            {
              ...dataWithoutId,
              status: "pending",
              day,
              month,
              year,
            },
          ]);

          if (error) {
            toast.error("Failed to shift the reminder date. Please try again.");
            setLoading(false);
            return;
          }
        }
        toast.success("Reminder saved successfully!");
        router.push(`/calendar`);
      }
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.");
      console.error("Error updating reminder:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    const { error } = await supabase
      .from("dayPlans")
      .delete()
      .eq("id", params.id);

    if (error) {
      toast.error("Failed to delete reminder. Please try again.");
      setLoading(false);
      return;
    }

    toast.success("Reminder deleted successfully!");
    setLoading(false);
    router.push(`/calendar`);
  };

  if (loading) {
    return <LoadingIcon />;
  }

  return (
    <main className="max-w-3xl mx-auto px-3 min-h-[90vh] pt-21">
      <section>
        <Button className="mb-10" onClick={() => history.back()}>
          <ArrowLeft /> Back
        </Button>
      </section>
      <section className="w-full text-start mb-12">
        <h2 className="text-3xl font-black text-primary">Edit Task</h2>
      </section>
      <section>
        <div className="mb-5">
          <Label htmlFor="task_title">Task Title*</Label>
          <Input
            type="text"
            id="task_title"
            className="mt-2"
            value={taskData.title}
            onChange={(e) =>
              setReminderData({ ...taskData, title: e.target.value })
            }
          />
        </div>
        <div className="mb-5">
          <Label htmlFor="task_time">Task Time*</Label>
          <Input
            type="time"
            id="task_time"
            className="mt-2"
            value={taskData.startTime}
            onChange={(e) =>
              setReminderData({ ...taskData, startTime: e.target.value })
            }
          />
        </div>
        <div className="mb-5">
          <Label htmlFor="task_description">Task Description</Label>
          <Textarea
            id="task_description"
            className="mt-2"
            value={taskData.description}
            onChange={(e) =>
              setReminderData({ ...taskData, description: e.target.value })
            }
          />
        </div>
        <div className="mb-5">
          <Label htmlFor="task_priority" className="mb-2">
            Task Priority*
          </Label>
          <Select
            value={taskData.priority}
            onValueChange={(value) =>
              setReminderData({
                ...taskData,
                priority: value as Task["priority"],
              })
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
        <div className="mb-5">
          <Label htmlFor="task_activity" className="mb-2">
            Task Activity*
          </Label>
          <Select
            value={taskData.activity}
            onValueChange={(value) =>
              setReminderData({ ...taskData, activity: value })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a status" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Activity</SelectLabel>
                {activities.map((activity) => (
                  <SelectItem className="capitalize" key={activity.id} value={activity.value}>
                    {activity.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="mb-5">
          <Label htmlFor="task_status" className="mb-2">
            Task Status*
          </Label>
          <Select
            value={taskData.status}
            onValueChange={(value) =>
              setReminderData({ ...taskData, status: value as Task["status"] })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a status" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Status</SelectLabel>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="shift">Shift</SelectItem>
                <SelectItem value="done">Done</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        {taskData.status === "shift" && (
          <div className="bg-accent px-2 py-4 rounded-md">
            <div className="flex flex-col gap-3">
              <Label htmlFor="date" className="px-1">
                Shift Date*
              </Label>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    id="date"
                    className="justify-between font-normal"
                  >
                    {date ? date.toLocaleDateString() : "Select date"}
                    <ChevronDownIcon />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto overflow-hidden p-0"
                  align="start"
                >
                  <Calendar
                    mode="single"
                    selected={date}
                    captionLayout="dropdown"
                    startMonth={new Date(currentYear, 0)}
                    endMonth={new Date(currentYear, 11)}
                    onSelect={(date) => {
                      setDate(date);
                      setOpen(false);
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <p className="px-1 mt-3 text-sm">
              Please select a new date for the shifted task. This task will be
              moved to the selected date.
            </p>
          </div>
        )}
        <div>
          <Button
            onClick={() => handleSubmit()}
            className="mt-4"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Task"}
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
          disabled={loading}
        >
          {loading ? "Deleting..." : "Delete Task"}
        </Button>
      </section>
    </main>
  );
}
