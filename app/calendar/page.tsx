"use client";
import { Calendar } from "@/components/ui/calendar";
import { useEffect, useMemo, useState } from "react";
import { holidays, Holiday } from "@/data/holidays";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/utils/supabase/client";
import type { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Reminder } from "@/types/reminders.type";
import { Edit } from "lucide-react";
import LoadingIcon from "@/components/loading-icon";
import CoverImage from "@/components/cover-image";

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

export default function Home() {
  const router = useRouter();

  const calendarYear = Number(process.env.NEXT_PUBLIC_CALENDAR_YEAR);
  const supabase = useMemo(() => createClient(), []);
  const [loading, setLoading] = useState<boolean>(true);

  const [user, setUser] = useState<User | null>(null);
  const [currentMonth, setCurrentMonth] = useState<number>(() =>
    new Date().getMonth()
  );
  const [currentYear, setCurrentYear] = useState<number>(() =>
    new Date().getFullYear()
  );
  //console.log("Current Month:", currentMonth);

  const today = [
    new Date().getDate(),
    new Date().getMonth() + 1,
    new Date().getFullYear(),
  ];

  //console.log("Today is:", today);

  const [currentHolidays, setCurrentHolidays] = useState<Holiday[]>(() => {
    const now = new Date();
    return holidays.filter((holiday) => holiday.month === now.getMonth() + 1);
  });

  const [reminders, setReminders] = useState<Reminder[]>([]);

  useEffect(() => {
    let cancelled = false;

    const fetchReminders = async () => {
      // Avoid querying with an undefined email (can lead to intermittent empty results).
      if (!user?.email) {
        setReminders([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("dayPlans")
          .select("*")
          .eq("email", user.email)
          .eq("month", currentMonth + 1)
          .eq("year", currentYear)
          .order("day", { ascending: true });

        if (error) {
          console.error("Error fetching day plans:", error);
          return;
        }

        if (!cancelled) {
          setReminders(data || []);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchReminders();

    return () => {
      cancelled = true;
    };
  }, [currentMonth, currentYear, supabase, user]);

  useEffect(() => {
    let cancelled = false;

    const loadUser = async () => {
      setLoading(true);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!cancelled) {
          setUser(user);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    loadUser();

    return () => {
      cancelled = true;
      subscription.subscription.unsubscribe();
    };
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const handleNavigation = (year: number, month: number) => {
    setCurrentYear(year);
    setCurrentMonth(month);

    const filteredHolidays = holidays.filter((holiday) => {
      return holiday.month === month + 1;
    });
    setCurrentHolidays(filteredHolidays);
  };

  const handleDateSelect = (date?: Date | Date[]) => {
    if (!date) return;
    const selectedDate = Array.isArray(date) ? date[0] : date;
    router.push(`/reminders/${selectedDate.toISOString()}`);
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
              onNextClick={(e) =>
                handleNavigation(e.getFullYear(), e.getMonth())
              }
              onPrevClick={(e) =>
                handleNavigation(e.getFullYear(), e.getMonth())
              }
              className="rounded-lg w-full"
              startMonth={new Date(calendarYear, 0)}
              endMonth={new Date(calendarYear, 11)}
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
          <div className="w-full h-full">
            <ul>
              {currentHolidays.map((holiday, index) => (
                <li key={index} className="text-md mt-2 font-bold">
                  {holiday.date} - {holiday.name}
                </li>
              ))}
            </ul>
          </div>
        </section>
        <section>
          <section className="w-full mb-16">
            <div className="text-center mb-8">
              <h2 className="text-[34px] font-black">Day Planer</h2>
              <p className="text-[12px]">
                Showing Day Planer for the{" "}
                <span className="font-bold">
                  {months[currentMonth]} {currentYear}
                </span>
              </p>
            </div>
            <div>
              <ul className="grid grid-cols-1 lg:grid-cols-2 gap-3 w-full">
                {reminders.length > 0 ? (
                  reminders.map((reminder, index) => (
                    <li
                      key={index}
                      className={`bg-accent ${
                        reminder.day < today[0] &&
                        reminder.month == today[1] &&
                        reminder.year == today[2]
                          ? "opacity-60"
                          : ""
                      } border-l-8 ${
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
                              router.push(`/reminders/edit/${reminder.id}`)
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
                    </li>
                  ))
                ) : (
                  <p className="text-center w-full col-span-2">
                    No Reminders available for this month.
                  </p>
                )}
              </ul>
            </div>
          </section>
          <section className="w-full max-w-3xl mb-16">
            <div className="text-center mb-8">
              <h2 className="text-[34px] font-black">Holidays</h2>
              <p className="text-[12px]">
                Showing holidays for the{" "}
                <span className="font-bold">
                  {months[currentMonth]} {currentYear}
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
              <Button variant="outline" onClick={handleLogout}>
                Sign Out
              </Button>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
