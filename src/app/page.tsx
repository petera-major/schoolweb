import Link from "next/link";
import {
  ShieldCheck,
  Sparkles,
  Heart,
  Clock,
  MessageCircle,
  Utensils,
  FileText,
  CreditCard,
  Banknote,
  CheckCircle2,
  GraduationCap,
  ScrollText,
} from "lucide-react";
import {
  ScribbleUnderline,
  SunDoodle,
  CloudDoodle,
  HeartDoodle,
  StarDoodle,
  SparkleX,
} from "@/components/Doodles";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const PROGRAMS = [
  {
    name: "PreK3",
    ages: "3 – 4 years",
    color: "var(--sky)",
    desc: "Gentle first steps away from home — sensory play, songs, and lots of cuddles while little ones build confidence and language.",
  },
  {
    name: "PreK4",
    ages: "4 – 5 years",
    color: "var(--pink)",
    desc: "Letters, numbers, and big imaginations. Hands-on activities build the school-readiness skills they'll need for kindergarten.",
  },
  {
    name: "Kindergarten",
    ages: "5 – 6 years",
    color: "var(--yellow)",
    desc: "Reading, writing, and early math come alive through structured lessons balanced with creative and outdoor play.",
  },
  {
    name: "Grade 1 Aftercare",
    ages: "6 – 8 years",
    color: "var(--orange)",
    desc: "Homework help, snacks, and supervised play after the school day — a safe landing spot until pick-up.",
  },
];

const REQUIREMENTS = [
  { label: "NIB Card", required: true },
  { label: "Health Certificate", required: true },
  { label: "Birth Certificate", required: true },
  { label: "Parent / Guardian Government ID", required: true },
  { label: "Report Card from Previous School", required: false },
  { label: "Proof of Insurance", required: false },
];

const STAFF = [
  {
    role: "Owner & Lead Teacher",
    badge: "20+ Years Experience",
    color: "var(--orange)",
    bio: "Our school is owned and personally run by a trained teacher with over 20 years of educational experience — teaching everywhere from preschool classrooms to high school. That range means she knows exactly how early learning sets the foundation for everything that comes after.",
  },
  {
    role: "Assistant Teacher",
    badge: "Experienced Educator",
    color: "var(--sky-dark)",
    bio: "Supporting every classroom is an experienced assistant teacher who helps bring our small-group attention and hands-on activities to life each day.",
  },
];

const WHY_US = [
  { icon: ShieldCheck, text: "Safe & secure environment" },
  { icon: Utensils, text: "Nutritious meals & snacks" },
  { icon: Sparkles, text: "Engaging, hands-on learning" },
  { icon: Clock, text: "Flexible drop-off & pick-up" },
  { icon: MessageCircle, text: "Real-time parent updates" },
];

const POLICIES = [
  "Fees are due by the end of each month for the following month.",
  "A $25 late fee applies to late payments and is non-negotiable.",
  "Withdrawing from the school requires a 30% return fee.",
  "Uniforms must be purchased from the school and display the school logo.",
  "Early drop-off (8:00 AM) must be arranged in advance with administration.",
  "Proof of insurance is mandatory for every enrolled student.",
  "Children with a contagious illness or symptoms must stay home.",
];

const FAQS = [
  {
    q: "What is included in the registration fee?",
    a: "The $100 registration fee includes your child's uniform. Registration is non-refundable, and it's billed together with the first month's tuition.",
  },
  {
    q: "How much is the first month versus following months?",
    a: "Your first month is $450 total (this includes the $100 registration + uniform and your first month of tuition). Every month after that is a flat $350.",
  },
  {
    q: "Do I need proof of insurance for my child?",
    a: "It's optional. If you have it, you can upload it during registration. If you don't, that's completely fine — an insurance form will be available at school on the first day for your child to sign up.",
  },
  {
    q: "When does school start?",
    a: "The first day of school is Monday, September 7, 2026. We can't wait to meet our little learners!",
  },
  {
    q: "How do I pay school fees?",
    a: "You can pay online or in person at the school office — whichever is easiest for your family. You'll choose your preferred method during registration.",
  },
  {
    q: "Is the report card from a previous school required?",
    a: "No — it's optional. We ask for it only if your child is transferring from another school, so we can understand where they're starting from.",
  },
  {
    q: "What sizes do the uniforms come in?",
    a: "Uniforms range from 3T–4T up through 9T–10T, so there's a size for every age group we serve, from PreK3 through Grade 1.",
  },
];

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        {/* HERO */}
        <section className="relative overflow-hidden bg-[var(--cream)]">
          <SunDoodle className="hidden sm:block absolute top-8 left-4 w-16 h-16 animate-float" />
          <CloudDoodle className="hidden sm:block absolute top-20 left-32 w-24 h-12 opacity-80" />
          <CloudDoodle className="hidden md:block absolute top-10 right-8 w-20 h-10 opacity-60" />
          <StarDoodle className="hidden sm:block absolute bottom-10 left-10 w-8 h-8 animate-float-2" />

          <div className="max-w-6xl mx-auto px-5 sm:px-8 pt-12 sm:pt-16 pb-16 sm:pb-20 grid lg:grid-cols-2 gap-10 items-center relative z-10">
            <div>
              <span className="inline-block bg-[var(--pink)]/30 text-[var(--pink-dark)] font-bold text-xs tracking-wide uppercase px-4 py-1.5 rounded-full mb-5">
                Now Enrolling · School Starts Sept 7, 2026
              </span>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.4rem] font-semibold leading-[1.08] mb-5">
                Where little learners{" "}
                <span className="scribble-underline text-[var(--orange-dark)]">
                  grow big
                  <ScribbleUnderline />
                </span>{" "}
                hearts &amp; minds
              </h1>
              <p className="text-base sm:text-lg opacity-80 max-w-md mb-8 leading-relaxed">
                Effective Learning Preschool &amp; Aftercare Institute gives your
                child a safe, loving space to learn, play, and thrive — from their
                very first steps through Grade 1.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 bg-[var(--orange)] hover:bg-[var(--orange-dark)] text-white font-bold px-7 py-3.5 rounded-full crayon-shadow transition-colors"
                >
                  Register Your Child
                </Link>
                <Link
                  href="/#programs"
                  className="inline-flex items-center gap-2 bg-white hover:bg-[var(--ink)]/5 text-[var(--ink)] font-bold px-7 py-3.5 rounded-full border-2 border-[var(--ink)]/15 transition-colors"
                >
                  See Our Programs
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -top-6 -right-4 sm:right-2 z-10">
                <HeartDoodle className="w-14 h-14 sm:w-20 sm:h-20" />
              </div>
              <div className="aspect-[4/3] wobble overflow-hidden crayon-shadow bg-[var(--sky)]">
                <video
                  className="w-full h-full object-cover"
                  src="/hero-vid.mp4"
                  poster="/hero-poster.jpg"
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="metadata"
                >
                  Your browser doesn&apos;t support embedded video.
                </video>
              </div>
              <SparkleX className="absolute -bottom-3 -left-3 w-7 h-7" />
            </div>
          </div>
        </section>

        {/* BANNER STRIP */}
        <section className="bg-[var(--sky)] py-6 sm:py-7">
          <p className="text-center font-display text-lg sm:text-2xl font-medium text-[var(--ink)] max-w-3xl mx-auto px-6 leading-snug">
            Quality childcare that nurtures learning, creativity, and confidence —
            in a secure, joyful environment.
          </p>
        </section>

        {/* MISSION */}
        <section id="about" className="max-w-6xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-display text-3xl sm:text-4xl font-semibold mb-4 text-[var(--orange-dark)]">
              Our Mission &amp; Philosophy
            </h2>
            <p className="opacity-80 leading-relaxed">
              At Effective Learning Preschool &amp; Aftercare Institute, we believe
              every child deserves a warm, engaging, and educational environment
              where they feel safe and loved. Our caregivers focus on early
              childhood development through structured activities, play, and a
              whole lot of heart.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-5">
            <div className="bg-[var(--sky)]/40 wobble p-7 text-center">
              <ShieldCheck className="w-9 h-9 mx-auto mb-3 text-[var(--sky-dark)]" />
              <p className="font-bold leading-snug">Licensed &amp; certified staff</p>
            </div>
            <div className="bg-[var(--pink)]/35 wobble p-7 text-center">
              <Heart className="w-9 h-9 mx-auto mb-3 text-[var(--pink-dark)]" />
              <p className="font-bold leading-snug">Years of early childhood care experience</p>
            </div>
            <div className="bg-[var(--orange)]/25 wobble p-7 text-center">
              <Sparkles className="w-9 h-9 mx-auto mb-3 text-[var(--orange-dark)]" />
              <p className="font-bold leading-snug">Strong focus on safety, hygiene &amp; development</p>
            </div>
          </div>
        </section>

        {/* TEAM / EXPERIENCE */}
        <section id="team" className="bg-[var(--sky)]/25 py-16 sm:py-20">
          <div className="max-w-6xl mx-auto px-5 sm:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="font-display text-3xl sm:text-4xl font-semibold mb-4">
                Meet the Team Behind the{" "}
                <span className="scribble-underline text-[var(--orange-dark)]">
                  Classroom
                  <ScribbleUnderline color="var(--orange)" />
                </span>
              </h2>
              <p className="opacity-75 leading-relaxed">
                Owned and operated by an educator, not an investor — our school is
                led by people who have spent their careers in the classroom.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {STAFF.map((member) => (
                <div key={member.role} className="bg-white wobble p-7 crayon-shadow">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
                    style={{ backgroundColor: member.color }}
                  >
                    <GraduationCap className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-display text-xl font-semibold mb-1">{member.role}</h3>
                  <span className="inline-block text-xs font-bold uppercase tracking-wide text-[var(--orange-dark)] bg-[var(--orange)]/15 px-3 py-1 rounded-full mb-3">
                    {member.badge}
                  </span>
                  <p className="text-sm opacity-80 leading-relaxed">{member.bio}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* WHY CHOOSE US */}
        <section className="max-w-6xl mx-auto px-5 sm:px-8 py-4 sm:py-10 grid lg:grid-cols-2 gap-10 items-center">
          <div className="relative">
            <SunDoodle className="absolute -top-6 left-4 w-12 h-12" />
            <div className="aspect-square max-w-sm mx-auto rounded-full bg-[var(--pink)]/35 flex items-center justify-center relative">
              <div className="w-3/4 aspect-square rounded-full bg-[var(--yellow)]/50 flex items-center justify-center">
                <Heart className="w-20 h-20 text-[var(--orange-dark)]" strokeWidth={1.5} />
              </div>
              <StarDoodle className="absolute bottom-2 right-2 w-9 h-9" />
              <SparkleX className="absolute top-4 right-0 w-6 h-6" />
            </div>
          </div>

          <div>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold mb-6">
              Why Choose Us?
            </h2>
            <ul className="space-y-3">
              {WHY_US.map((item) => (
                <li
                  key={item.text}
                  className="flex items-center gap-3 bg-[var(--sky)]/30 rounded-full px-5 py-3.5 font-bold text-sm sm:text-base"
                >
                  <span className="bg-white rounded-full p-1.5 flex-shrink-0">
                    <item.icon className="w-4 h-4 text-[var(--sky-dark)]" strokeWidth={2.5} />
                  </span>
                  {item.text}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* PROGRAMS */}
        <section id="programs" className="bg-[var(--orange)] py-16 sm:py-20 mt-16">
          <div className="max-w-6xl mx-auto px-5 sm:px-8">
            <h2 className="text-center font-display text-3xl sm:text-4xl font-semibold text-white mb-3">
              Programs &amp; Curriculum
            </h2>
            <p className="text-center text-white/85 max-w-xl mx-auto mb-12">
              A program for every age and stage, from first words to first homework
              assignments.
            </p>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {PROGRAMS.map((p) => (
                <div key={p.name} className="bg-white wobble p-6 crayon-shadow flex flex-col">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center mb-4 font-display font-bold text-white text-sm"
                    style={{ backgroundColor: p.color }}
                  >
                    {p.ages.split(" ")[0]}
                  </div>
                  <h3 className="font-display text-xl font-semibold mb-1">{p.name}</h3>
                  <p className="text-xs font-bold opacity-60 mb-3 uppercase tracking-wide">
                    {p.ages}
                  </p>
                  <p className="text-sm opacity-80 leading-relaxed">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* REQUIREMENTS */}
        <section id="requirements" className="max-w-6xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold mb-4">
                What to Bring for{" "}
                <span className="scribble-underline text-[var(--orange-dark)]">
                  Registration
                  <ScribbleUnderline color="var(--sky-dark)" />
                </span>
              </h2>
              <p className="opacity-75 mb-8 leading-relaxed max-w-md">
                Gather these documents before you start your application. Don&apos;t
                worry — you&apos;ll be able to upload photos or scans of each one right
                from your phone or computer.
              </p>

              <ul className="space-y-3">
                {REQUIREMENTS.map((req) => (
                  <li
                    key={req.label}
                    className="bg-white wobble px-5 py-4 crayon-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-3 font-bold">
                        <FileText className="w-5 h-5 text-[var(--sky-dark)] flex-shrink-0" />
                        {req.label}
                      </span>
                      {req.required ? (
                        <span className="text-xs font-bold uppercase tracking-wide text-[var(--orange-dark)] bg-[var(--orange)]/15 px-3 py-1 rounded-full">
                          Required
                        </span>
                      ) : (
                        <span className="text-xs font-bold uppercase tracking-wide opacity-50 bg-[var(--ink)]/5 px-3 py-1 rounded-full">
                          Optional
                        </span>
                      )}
                    </div>
                    {req.label === "Proof of Insurance" && (
                      <p className="text-xs opacity-60 mt-2 pl-8 leading-relaxed">
                        Don&apos;t have it? No problem — an insurance form will be
                        available at school on the first day for your child to
                        sign up.
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-[var(--sky)]/30 wobble p-8 sm:p-10 relative">
              <CloudDoodle className="absolute -top-6 right-6 w-20 h-10 opacity-70" />
              <h3 className="font-display text-2xl font-semibold mb-5">
                Uniform Sizing Guide
              </h3>
              <p className="text-sm opacity-75 mb-5 leading-relaxed">
                Pick the size that fits your child best — included free with
                registration.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {["3T–4T", "4T–5T", "5T–6T", "6T–7T", "7T–8T", "9T–10T"].map((size) => (
                  <div
                    key={size}
                    className="bg-white rounded-xl py-3 text-center font-bold font-display text-lg crayon-shadow"
                  >
                    {size}
                  </div>
                ))}
              </div>
              <p className="text-xs opacity-60 mt-5 leading-relaxed">
                Not sure which size fits? You&apos;ll be able to ask our staff to help
                during your registration appointment, or pick your best guess now —
                sizes can always be exchanged in the first two weeks.
              </p>
            </div>
          </div>
        </section>

        {/* FEES */}
        <section id="fees" className="bg-[var(--pink)]/25 py-16 sm:py-20">
          <div className="max-w-6xl mx-auto px-5 sm:px-8">
            <h2 className="text-center font-display text-3xl sm:text-4xl font-semibold mb-3">
              School Fees, Made Simple
            </h2>
            <p className="text-center opacity-75 max-w-xl mx-auto mb-3">
              One straightforward price for your first month, then a flat monthly
              rate after that.
            </p>
            <p className="text-center font-bold text-sm text-[var(--orange-dark)] mb-12">
              First day of school: September 7, 2026
            </p>

            <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
              <div className="bg-white wobble p-8 crayon-shadow border-4 border-[var(--orange)]">
                <span className="text-xs font-bold uppercase tracking-wide text-[var(--orange-dark)] bg-[var(--orange)]/15 px-3 py-1 rounded-full">
                  First Month
                </span>
                <p className="font-display text-5xl font-semibold mt-4 mb-1">$450</p>
                <p className="text-sm opacity-70 mb-5">
                  Includes $100 registration fee &amp; uniform, plus your child&apos;s
                  first month of tuition.
                </p>
                <p className="text-xs font-bold uppercase tracking-wide opacity-50">
                  Registration is non-refundable
                </p>
              </div>

              <div className="bg-white wobble p-8 crayon-shadow">
                <span className="text-xs font-bold uppercase tracking-wide text-[var(--sky-dark)] bg-[var(--sky)]/25 px-3 py-1 rounded-full">
                  Every Month After
                </span>
                <p className="font-display text-5xl font-semibold mt-4 mb-1">$350</p>
                <p className="text-sm opacity-70 mb-5">
                  Flat monthly tuition for as long as your child is enrolled with
                  us.
                </p>
                <p className="text-xs font-bold uppercase tracking-wide opacity-50">
                  Billed monthly
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-5 max-w-3xl mx-auto mt-8">
              <div className="bg-white/70 rounded-2xl p-5 flex items-center gap-3">
                <CreditCard className="w-7 h-7 text-[var(--sky-dark)] flex-shrink-0" />
                <div>
                  <p className="font-bold text-sm">Pay Online</p>
                  <p className="text-xs opacity-70">Secure card payment from home</p>
                </div>
              </div>
              <div className="bg-white/70 rounded-2xl p-5 flex items-center gap-3">
                <Banknote className="w-7 h-7 text-[var(--orange-dark)] flex-shrink-0" />
                <div>
                  <p className="font-bold text-sm">Pay In Person</p>
                  <p className="text-xs opacity-70">Cash or card at our front office</p>
                </div>
              </div>
            </div>

            <div className="text-center mt-10">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 bg-[var(--orange)] hover:bg-[var(--orange-dark)] text-white font-bold px-8 py-4 rounded-full crayon-shadow transition-colors"
              >
                Start Registration
              </Link>
            </div>
          </div>
        </section>

        {/* POLICY */}
        <section id="policy" className="bg-[var(--orange)]/10 py-16 sm:py-20">
          <div className="max-w-3xl mx-auto px-5 sm:px-8">
            <div className="text-center mb-10">
              <ScrollText className="w-10 h-10 mx-auto mb-4 text-[var(--orange-dark)]" />
              <h2 className="font-display text-3xl sm:text-4xl font-semibold mb-3">
                School Policy
              </h2>
              <p className="opacity-75 leading-relaxed">
                Please review these policies before registering — you&apos;ll be
                asked to confirm you&apos;ve read them as part of the registration
                form.
              </p>
            </div>

            <div className="bg-white wobble crayon-shadow p-7 sm:p-9">
              <ul className="space-y-4">
                {POLICIES.map((policy) => (
                  <li key={policy} className="flex gap-3 leading-relaxed">
                    <span className="text-[var(--orange-dark)] font-bold flex-shrink-0">•</span>
                    <span>{policy}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="max-w-3xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
          <h2 className="text-center font-display text-3xl sm:text-4xl font-semibold mb-12">
            Common Questions
          </h2>
          <div className="space-y-4">
            {FAQS.map((item) => (
              <details
                key={item.q}
                className="group bg-white wobble crayon-shadow px-6 py-5 [&_summary::-webkit-details-marker]:hidden"
              >
                <summary className="font-bold cursor-pointer flex items-center justify-between gap-4">
                  {item.q}
                  <span className="text-[var(--orange-dark)] text-xl flex-shrink-0 group-open:rotate-45 transition-transform">
                    +
                  </span>
                </summary>
                <p className="text-sm opacity-75 mt-3 leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="relative overflow-hidden bg-[var(--sky)] py-16 sm:py-20">
          <StarDoodle className="hidden sm:block absolute top-6 left-10 w-9 h-9" />
          <HeartDoodle className="hidden sm:block absolute bottom-6 right-12 w-12 h-12" />
          <div className="max-w-2xl mx-auto px-5 text-center relative z-10">
            <h2 className="font-display text-3xl sm:text-4xl font-semibold mb-4">
              Ready to give your child a wonderful place to grow?
            </h2>
            <p className="opacity-80 mb-8">
              Registration takes about 10 minutes. Have your documents ready and
              you&apos;re all set.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-[var(--orange)] hover:bg-[var(--orange-dark)] text-white font-bold px-8 py-4 rounded-full crayon-shadow transition-colors"
            >
              <CheckCircle2 className="w-5 h-5" />
              Register Your Child Now
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}