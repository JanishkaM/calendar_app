"use client";
import * as z from "zod";
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
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ChevronDownIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Task } from "@/types/task.type";
import { activities } from "@/data/activities";

const days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const TaskSchema = z.object({
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
  const supabase = createClient();
  const router = useRouter();
  const currentYear = Number(process.env.NEXT_PUBLIC_CALENDAR_YEAR);

  const today = [
    new Date().getDate(),
    new Date().getMonth() + 1,
    new Date().getFullYear(),
    new Date().getDay(),
  ];

  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());

  const [taskData, setReminderData] = useState<Task>({
    title: "",
    description: "",
    priority: "low",
    month: date ? date.getMonth() + 1 : today[1],
    day: date ? date.getDate() : today[0],
    year: date ? date.getFullYear() : today[2],
    email: "",
    created_at: "",
    activity: "",
    startTime: "",
    status: "pending",
  });

  const setTaskDate = (date: Date) => {
    setReminderData((prev) => ({
      ...prev,
      month: date.getMonth() + 1,
      day: date.getDate(),
      year: date.getFullYear(),
    }));
  };

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user?.email) {
        setReminderData((prev) => ({ ...prev, email: user.email ?? "" }));
      }
      console.log(user);
      setLoading(false);
    };
    fetchUser();
  }, [supabase]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const result = TaskSchema.safeParse(taskData);

      if (!result.success) {
        const pretty = z.prettifyError(result.error);
        toast.error(`${pretty}`);
        setLoading(false);
        return;
      } else {
        const { error } = await supabase.from("dayPlans").insert([result.data]);
        if (error) {
          toast.error("Failed to save task. Please try again.");
          setLoading(false);
          return;
        }
        toast.success("Task saved successfully!");
        setReminderData((prev) => ({
          ...prev,
          title: "",
          description: "",
          startTime: "",
          activity: "",
          status: "pending",
          priority: "low",
        }));
      }
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.");
      console.log("Error details:", error);
      setLoading(false);
      return;
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingIcon />;
  }

  return (
    <main className="max-w-3xl mx-auto px-3 min-h-[90vh] pt-21">
      <section className="w-full">
        <Button className="mb-10" onClick={() => router.push("/calendar")}>
          <ArrowLeft /> Back
        </Button>
      </section>
      <section className="w-full text-start mb-10">
        <h2 className="text-3xl font-black text-primary">Add Task</h2>
        <p>
          Adding a new task for{" "}
          <span className="font-bold">
            {days[date ? date.getDay() : today[3]]},{" "}
            {date ? months[date.getMonth()] : months[today[1] - 1]}{" "}
            {date ? date.getDate() : today[0]}
          </span>
        </p>
      </section>
      <section className="w-full">
        <div className="mb-5">
          <div className="flex flex-col gap-3">
            <Label htmlFor="date" className="px-1">
              Task Date
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
                    setTaskDate(date!);
                    setOpen(false);
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <div className="mb-5">
          <Label htmlFor="task_title"> Task Title*</Label>
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
          <Label htmlFor="task_start_time">Task Start Time*</Label>
          <Input
            type="time"
            id="task_start_time"
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
              <SelectValue placeholder="Select an activity" />
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
        <Button
          onClick={() => handleSubmit()}
          className="mt-4"
          disabled={loading}
        >
          {loading ? "Saving..." : "Save Task"}
        </Button>
      </section>
    </main>
  );
}
