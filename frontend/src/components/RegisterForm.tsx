"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { COLLEGES, EVENTS } from "@/lib/constants"
import { createClient } from "@/utils/supabase/client"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export default function RegisterForm() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [college, setCollege] = useState("")
  const [branch, setBranch] = useState("")
  const [year, setYear] = useState("")
  const [loading, setLoading] = useState(false)
  const [selectedEvents, setSelectedEvents] = useState<number[]>([])
  const [eventCounts, setEventCounts] = useState<number[]>(
    new Array(EVENTS.length).fill(0)
  )

  const supabase = createClient()

  useEffect(() => {
    const fetchEventCounts = async () => {
      const { data, error } = await supabase
        .from("registrations")
        .select("events")

      if (error) {
        console.error("Error fetching event counts:", error)
        return
      }

      const counts = new Array(EVENTS.length).fill(0)
      data.forEach((registration) => {
        const events = JSON.parse(registration.events)



        if (Array.isArray(events)) {
          events.forEach((event: any) => {
            counts[event] += 1
          })
        } else if (typeof events === 'object') {
          Object.values(events).forEach((event: any) => {
            counts[event] += 1
          })
        }
      })

      setEventCounts(counts)
    }

    fetchEventCounts()
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast.error("Invalid email format")
      return
    }

    if (phone.length !== 10 || !/^\d{10}$/.test(phone)) {
      toast.error("Phone number must be exactly 10 digits")
      return
    }

    if (selectedEvents.length === 0) {
      toast.error("Please select at least one event to RSVP")
      return
    }

    for (const eventIndex of selectedEvents) {
      if (eventCounts[eventIndex] >= EVENTS[eventIndex].seats) {
        toast.error(
          `Registration for "${EVENTS[eventIndex].name}" is full. Please select another event.`
        )
        return
      }
    }

    setLoading(true)

    const { data, error } = await supabase.from("registrations").insert([
      {
        name: name,
        email: email,
        phone: phone,
        college: college,
        branch: branch,
        year: year,
        events: selectedEvents,
      },
    ])

    if (error) {
      setLoading(false)
      console.error("Error inserting data:", error)
      toast.error("Registration Failed", {
        description: "Please try again later.",
      })
    } else {
      toast.success("Registration Successful!", {
        description: "We're excited to see you at the event!",
      })
      setLoading(false)
      setName("")
      setEmail("")
      setPhone("")
      setCollege("")
      setBranch("")
      setYear("")
      setSelectedEvents([])
      const newEventCounts = [...eventCounts]
      selectedEvents.forEach((eventIndex) => {
        newEventCounts[eventIndex] += 1
      })
      setEventCounts(newEventCounts)
    }
  }

  return (
    <div className="max-w-2xl mx-auto md:pt-5 pt-10">
      <div className="fixed top-0 left-0 border-white/10 bg-background z-50 w-full p-5 py-7 border-b">
        <div className="max-w-7xl mx-auto md:px-5">
          <Link href="/">
            <Image
              priority
              src="/logo_h.png"
              alt="logo"
              className="w-40 h-4"
              width={500}
              height={500}
            />
          </Link>
        </div>
      </div>

      <form className="space-y-6 p-5" onSubmit={handleSubmit}>
        <img
          className="w-full rounded-2xl"
          src="/cover.png"
          alt="cover"
          width={500}
          height={500}
        />
        <div className="space-y-2 md:py-5 py-5 text-center">
          <h1 className="md:text-3xl text-2xl font-bold">Event Registration</h1>
          <p className="text-gray-400 dark:text-gray-500 md:text-base text-sm tracking-wide">
            Fill out the form below to register for the event.
          </p>
        </div>
        <div className="space-y-4 pb-10">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              disabled={loading}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              disabled={loading}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              disabled={loading}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              type="tel"
              placeholder="Enter your phone number"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="college">College</Label>
            <Select
              onValueChange={(value) => setCollege(value)}
              defaultValue={college}
              disabled={loading}
              name="college"
              required
            >
              <SelectTrigger id="college">
                <SelectValue placeholder="Select your college" />
              </SelectTrigger>
              <SelectContent>
                {COLLEGES.map((college) => (
                  <SelectItem key={college} value={college}>
                    {college}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="branch">Branch</Label>
            <Input
              id="branch"
              disabled={loading}
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              type="text"
              placeholder="Enter your branch (CS, IS, EC)"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="year">Year of Study</Label>
            <Select
              onValueChange={(value) => setYear(value)}
              defaultValue={year}
              disabled={loading}
              name="year"
              required
            >
              <SelectTrigger id="year">
                <SelectValue placeholder="Select your year of study" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1</SelectItem>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="3">3</SelectItem>
                <SelectItem value="4">4</SelectItem>
                <SelectItem value="5">5</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-4 pt-8">
            <h2 className="md:text-2xl text-xl font-bold text-primary">
              Event RSVP
            </h2>
            <div className="space-y-5 mb-2">
              {EVENTS.map((event, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="space-y-1 flex-1">
                    <p className="font-medium">
                      {event.name} -{" "}
                      <span className="text-primary">{event.type}</span>
                    </p>
                    <div className="text-sm text-gray-400">
                      <p>Speaker: {event.speaker}</p>
                      <p>Date: {event.date}</p>
                      <p>Time: {event.time}</p>
                      {event.seats - eventCounts[index] < 20 &&
                        event.seats - eventCounts[index] !== 0 ? (
                        <p className="text-red-400">
                          Hurry Up! Only {event.seats - eventCounts[index]}{" "}
                          Seats Available
                        </p>
                      ) : (
                        <p>
                          {event.seats - eventCounts[index] === 0 ? (
                            <span className="text-red-400">Seats Full :(</span>
                          ) : (
                            <span>
                              Available Seats:{" "}
                              {event.seats - eventCounts[index]}
                            </span>
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                  <Input
                    type="checkbox"
                    checked={selectedEvents.includes(index)}
                    disabled={loading || eventCounts[index] >= event.seats}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedEvents([...selectedEvents, index])
                      } else {
                        setSelectedEvents(
                          selectedEvents.filter((i) => i !== index)
                        )
                      }
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
          <Button
            type="submit"
            disabled={loading || selectedEvents.length === 0}
            className="w-full"
          >
            {loading ? "Registering..." : "Register Now"}
          </Button>
        </div>
      </form>
    </div>
  )
}
