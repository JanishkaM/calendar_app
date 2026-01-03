"use client";
import { Calendar } from "@/components/ui/calendar";
import { useCallback, useEffect, useMemo, useState } from "react";
import { holidays, Holiday } from "@/data/holidays";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/utils/supabase/client";
import type { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Task } from "@/types/task.type";
import { Edit, ListTodo, Plus, X } from "lucide-react";
import LoadingIcon from "@/components/loading-icon";
import CoverImage from "@/components/cover-image";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

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

const wait = () => new Promise((resolve) => setTimeout(resolve, 200));

export default function Home() {
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [open, setOpen] = useState(false);

  const today = [
    new Date().getDate(),
    new Date().getMonth() + 1,
    new Date().getFullYear(),
  ];
  const [user, setUser] = useState<User | null>(null);
  const currentYear = Number(process.env.NEXT_PUBLIC_CALENDAR_YEAR);

  const [selectedMonth, setSelectedMonth] = useState<number>(today[1] - 1);
  const [selectedDay, setSelectedDay] = useState<number>(today[0]);

  const [currentHolidays, setCurrentHolidays] = useState<Holiday[]>(() => {
    const now = new Date();
    return holidays.filter((holiday) => holiday.month === now.getMonth() + 1);
  });

  const [reminders, setReminders] = useState<Task[]>([]);

  const fetchReminders = useCallback(
    async (
      day: number,
      month: number,
      userEmail: string = user?.email || ""
    ) => {
      setLoading(true);

      if (!userEmail) {
        setReminders([]);
        setLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from("dayPlans")
          .select("*")
          .eq("email", userEmail)
          .eq("month", month)
          .eq("year", currentYear)
          .eq("day", day);

        if (error) {
          console.error("Error fetching day plans:", error);
          return;
        }
        setReminders(data || []);
      } catch (error) {
        console.error("Error fetching day plans:", error);
      } finally {
        setLoading(false);
      }
    },
    [currentYear, supabase, user?.email]
  );

  useEffect(() => {
    fetchReminders(selectedDay, selectedMonth + 1, user?.email);
  }, [fetchReminders, selectedDay, selectedMonth, user?.email]);

  useEffect(() => {
    const loadUser = async () => {
      setLoading(true);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        setUser(user);
      } finally {
        setLoading(false);
      }
    };

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    loadUser();

    return () => {
      subscription.subscription.unsubscribe();
    };
  }, [supabase]);

  const handleLogout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    router.push("/");
  };

  const handleNavigation = (month: number) => {
    setSelectedMonth(month);

    const filteredHolidays = holidays.filter((holiday) => {
      return holiday.month === month + 1;
    });
    setCurrentHolidays(filteredHolidays);
  };

  const handleDateSelect = async (date?: Date | Date[]) => {
    if (!date) return;
    const selectedDate = Array.isArray(date) ? date[0] : date;
    const day = selectedDate.getDate();
    const month = selectedDate.getMonth() + 1;

    setSelectedDay(day);
    setSelectedMonth(selectedDate.getMonth());
    await fetchReminders(day, month, user?.email);
    wait().then(() => setOpen((prev) => !prev));
  };

  return (
    <>
      <CoverImage />
      <main className="pt-5 md:pt-21 items-start w-full mx-auto max-w-3xl px-3">
        {loading && <LoadingIcon />}
        <section className="flex flex-col mb-21 gap-7">
          <div className="w-full h-full">
            <Calendar
              mode="single"
              showWeekNumber={true}
              onNextClick={(e) => handleNavigation(e.getMonth())}
              onPrevClick={(e) => handleNavigation(e.getMonth())}
              className="w-full"
              startMonth={new Date(currentYear, 0)}
              endMonth={new Date(currentYear, 11)}
              onSelect={(date) => handleDateSelect(date)}
              modifiers={{
                publicHoliday: (date) =>
                  holidays.some(
                    (holiday) =>
                      holiday.publicHoliday &&
                      holiday.date === date.getDate() &&
                      holiday.month === date.getMonth() + 1
                  ),
                bankHoliday: (date) =>
                  holidays.some(
                    (holiday) =>
                      holiday.bankHoliday &&
                      holiday.date === date.getDate() &&
                      holiday.month === date.getMonth() + 1
                  ),
                mercantileHoliday: (date) =>
                  holidays.some(
                    (holiday) =>
                      holiday.mercantileHoliday &&
                      holiday.date === date.getDate() &&
                      holiday.month === date.getMonth() + 1
                  ),
              }}
              fixedWeeks={true}
              numberOfMonths={1}
            />
          </div>
        </section>
        <section>
          <div>
            <div className="fixed bottom-4 left-4">
              <Button size="icon" onClick={() => router.push("/task/new")}>
                <Plus className="size-7" />
              </Button>
            </div>
          </div>
          <Drawer autoFocus open={open} onOpenChange={setOpen}>
              <DrawerTrigger className="bg-primary fixed bottom-4 right-4 size-9 rounded-md flex items-center justify-center shadow-lg hover:shadow-xl">
                <ListTodo className="size-7" />
              </DrawerTrigger>
            <DrawerContent className="max-w-4xl mx-auto">
              <DrawerHeader className="text-start">
                <DrawerTitle>Day Plans</DrawerTitle>
                <DrawerDescription>
                  Showing Day Planer for the{" "}
                  <span className="font-bold">
                    {selectedDay} {months[selectedMonth]}
                  </span>
                </DrawerDescription>
              </DrawerHeader>
              <div className="px-1 grid grid-cols-1 md:grid-cols-2 gap-2 mb-5 scroll-auto overflow-y-scroll">
                {reminders.length > 0 ? (
                  reminders.map((reminder, index) => (
                    <div
                      key={index}
                      className={`bg-accent border-l-8 ${
                        reminder.priority === "low"
                          ? "border-green-500"
                          : reminder.priority === "medium"
                          ? "border-yellow-500"
                          : "border-red-500"
                      } p-3 rounded-md`}
                    >
                      <div className="flex justify-between items-start gap-3 mb-3">
                        <div>
                          <h3 className="font-bold text-xl capitalize">
                            {reminder.title}
                          </h3>
                          <p className="text-sm capitalize">
                            {reminder.description}
                          </p>
                        </div>
                        <div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="p-2 bg-background/50 hover:bg-background/20"
                            onClick={() =>
                              router.push(`/task/edit/${reminder.id}`)
                            }
                          >
                            <Edit />
                          </Button>
                        </div>
                      </div>
                      <p className="mb-2">
                        {months[reminder.month - 1]} {reminder.day},{" "}
                        {reminder.year} at {reminder.startTime.slice(0, 5)}
                      </p>
                      <p className="flex flex-wrap gap-2">
                        <Badge className="capitalize bg-primary">
                          {reminder.activity}
                        </Badge>
                        <Badge
                          className={`capitalize ${
                            reminder.status == "pending"
                              ? "bg-yellow-500"
                              : reminder.status == "done"
                              ? "bg-green-500"
                              : "bg-red-500"
                          }`}
                        >
                          {reminder.status}
                        </Badge>
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-center w-full col-span-2">
                    No Reminders available for this day.
                  </p>
                )}
              </div>
              <DrawerClose className="fixed right-3 bottom-3 bg-primary/60 max-w-30 rounded-md px-2 py-2">
                <X />
              </DrawerClose>
            </DrawerContent>
          </Drawer>
          <section className="w-full max-w-3xl mb-16">
            <div className="mb-4 text-center">
              <h2 className="text-[34px] font-black">Holidays</h2>
              <p className="text-[12px]">
                Showing holidays for the{" "}
                <span className="font-bold">
                  {months[selectedMonth]} {currentYear}
                </span>
              </p>
            </div>
            <div>
              <ul className="grid grid-cols-1 lg:grid-cols-2 gap-3 w-full">
                {currentHolidays.length > 0 ? (
                  currentHolidays.map((holiday, index) => (
                    <li key={index} className="bg-accent p-3 rounded-md">
                      <h3 className="font-black text-xl">{holiday.name}</h3>
                      <p className="text-sm mb-3">{holiday.description}</p>
                      <p className="mb-2 text-lg">
                        {months[holiday.month - 1]} {holiday.date},{" "}
                        {holiday.day}
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        {holiday.publicHoliday && (
                          <Badge className="bg-orange-500">
                            Public Holiday
                          </Badge>
                        )}
                        {holiday.bankHoliday && (
                          <Badge className="bg-blue-500">Bank Holiday</Badge>
                        )}
                        {holiday.mercantileHoliday && (
                          <Badge className="bg-green-500">
                            Mercantile Holiday
                          </Badge>
                        )}
                      </div>
                    </li>
                  ))
                ) : (
                  <p className="text-center w-full col-span-2">
                    No holidays available for this month.
                  </p>
                )}
              </ul>
            </div>
          </section>
        </section>
        {/* User Profile Section */}
        {user && (
          <div className="col-span-full w-full max-w-4xl mx-auto mb-8 p-4 bg-accent rounded-lg">
            <div className="flex flex-col md:flex-row items-center gap-3 justify-between">
              <div className="flex items-center gap-4">
                {user.user_metadata?.avatar_url && (
                  <Image
                    src={user.user_metadata.avatar_url}
                    alt="Profile"
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-full"
                  />
                )}
                <div>
                  <p className="font-bold text-lg">
                    {user.user_metadata?.full_name || "User"}
                  </p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <Button className="bg-red-500 hover:bg-red-700" onClick={() => handleLogout()}>
                Sign Out
              </Button>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
