import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";

// ── Hardcoded Q&A knowledge base ──────────────────────────────────────────────

interface QA {
  keywords: string[];
  answer: string;
}

const QA_BASE: QA[] = [
  {
    keywords: ["murojaat", "yuborish", "qanday", "submit", "report"],
    answer: "Murojaat yuborish uchun: 1) Bosh sahifadagi \"Murojaat\" tugmasini bosing, 2) Muassasa turini tanlang (maktab, poliklinika va boshqalar), 3) Muassasani toping, 4) Muammo turini va tavsifini kiriting, 5) Yuborish tugmasini bosing. Har bir murojaat uchun +5 ball olasiz! 🎯",
  },
  {
    keywords: ["status", "holat", "ko'rib", "jarayon", "progress"],
    answer: "Murojaatlar 5 holatda bo'ladi:\n🟡 Qabul qilindi — murojaatingiz tizimga tushdi\n🔵 Ko'rib chiqilmoqda — mas'ullar tekshirayapti\n🟣 Bajarilmoqda — ta'mirlash boshlandi\n🟢 Bajarildi — muammo hal qilindi\n🔴 Rad etildi — asossiz topildi",
  },
  {
    keywords: ["ball", "reyting", "coin", "score", "ballar"],
    answer: "Ball tizimi:\n⭐ Murojaat yuborish = +5 ball\n👍 Murojaatingizga ovoz = +1 ball\n✅ Murojaat hal qilinsa = +10 ball\n\nUnvonlar:\n🌱 0–49: Yangi fuqaro\n⭐ 50–149: Faol fuqaro\n🏅 150–299: Ishtirokchi\n💪 300–499: Jamoat a'zosi\n🔥 500–999: Fidoyi\n👑 1000+: Xalq yetakchisi",
  },
  {
    keywords: ["unvon", "title", "daraja", "nishon"],
    answer: "Unvonlar ball miqdoriga qarab beriladi:\n🌱 Yangi fuqaro — 0 ball\n⭐ Faol fuqaro — 50 ball\n🏅 Ishtirokchi — 150 ball\n💪 Jamoat a'zosi — 300 ball\n🔥 Fidoyi — 500 ball\n👑 Xalq yetakchisi — 1000 ball\n\nKo'proq murojaat yuboring va unvon oshiring!",
  },
  {
    keywords: ["maktab", "school", "ta'lim", "o'quv"],
    answer: "Maktablar bo'limida umumta'lim maktablari ro'yxatga olingan. Ular bilan bog'liq muammolar: infratuzilma, tozalik, isitish, xodimlar yetishmasligi va boshqalar. Hozir tizimda ko'plab maktab ob'ektlari mavjud.",
  },
  {
    keywords: ["poliklinika", "tibbiy", "clinic", "shifoxona", "doktor"],
    answer: "Poliklinikalar bo'limida tibbiy muassasalar ro'yxati bor. Muammolar: navbat tizimi, shifokorlar soni, xona tozaligi, dori-darmon ta'minoti va xizmat sifati. Muammo ko'rsang — murojaat qil! 🏥",
  },
  {
    keywords: ["yo'l", "ko'cha", "road", "asfalt", "trot"],
    answer: "Yo'llar va ko'priklar bo'limida transport infratuzilmasi bor. Teshik yo'l, buzilgan trotuar, chiroq ishlamasligi — bularning barchasini murojaat orqali bildirish mumkin. 🛣️",
  },
  {
    keywords: ["suv", "water", "truba", "quvur", "ta'minot"],
    answer: "Suv ta'minoti bo'limida ichimlik suvi va kanalizatsiya muammolari qaraladi. Suv kelmasa, quvur sizsa yoki suv sifati yomon bo'lsa — murojaat yuboring. 💧",
  },
  {
    keywords: ["bog'cha", "kindergarten", "maktabgacha", "bola"],
    answer: "Bog'chalar bo'limida maktabgacha ta'lim muassasalari mavjud. Qurilish holati, ovqatlanish sifati, xodimlar muammolari haqida murojaat qilishingiz mumkin. 👶",
  },
  {
    keywords: ["statistika", "stat", "grafik", "chart", "ma'lumot"],
    answer: "Statistika sahifasida (\"/statistics\") ko'rishingiz mumkin:\n📊 Murojaat turlari bo'yicha taqsimot\n🗺️ Viloyatlar bo'yicha xarita\n📈 Hal qilingan murojaatlar ulushi\n⭐ Xizmat reytingi\n\nHozirgi ko'rsatkichlar tizimda doimiy yangilanib turadi.",
  },
  {
    keywords: ["yangilik", "news", "xabar"],
    answer: "Yangiliklar sahifasida (\"/news\") hududlaringiz bo'yicha so'nggi voqealar, e'lonlar va infratuzilma yangiliklari joylashtirilgan. Mintaqa va mavzu bo'yicha filtrlash mumkin.",
  },
  {
    keywords: ["byudjet", "budget", "pul", "moliya", "xarajat"],
    answer: "Byudjet sahifasida (\"/budget\") davlat mablag'lari qayerga sarflanayotgani ko'rsatiladi: ta'lim, sog'liqni saqlash, yo'l va boshqa sohalar. Shaffoflik va nazorat uchun ochiq ma'lumot.",
  },
  {
    keywords: ["tekshiruv", "checklist", "monitoring", "dastur"],
    answer: "Tekshiruv dasturlari (\"/checklist\") fuqarolar uchun: muassasalarni o'zi borib tekshirish imkonini beradi. Har bir tekshiruv uchun ball olinadi. Hozir 4 ta dastur faol:\n🧼 Toza qo'llar (maktab tozaligi)\n🏥 Sog'lom poliklinika\n🛣️ Xavfsiz yo'l\n💧 Toza suv",
  },
  {
    keywords: ["leaderboard", "reyting", "top", "eng yaxshi", "birinchi"],
    answer: "Fuqarolar reytingida (\"/leaderboard\") eng faol ishtirokchilar ko'rsatiladi. Top 3 ta fuqaro altın, kumush va bronza medallarini oladi! Siz ham murojaat yuborib va ovoz yig'ib reyting tepasiga chiqishingiz mumkin. 🏆",
  },
  {
    keywords: ["anonimlik", "anonim", "yashirin", "anonymous"],
    answer: "Ha, murojaatni anonim yuborish mumkin! Murojaat yuborishda \"Anonim yuborish\" tugmasini yoqing. Bu holda ismingiz boshqa foydalanuvchilarga ko'rsatilmaydi. 🔒",
  },
  {
    keywords: ["ovoz", "vote", "like", "yoqtirish"],
    answer: "Murojaatlarga ovoz berish mumkin — bu muammoning muhimligini bildiradi. Ko'proq ovoz olgan murojaatlar mas'ullar tomonidan tezroq ko'rib chiqiladi. Har bir ovoz uchun muallifga +1 ball qo'shiladi. 👍",
  },
  {
    keywords: ["foto", "rasm", "photo", "image", "surat"],
    answer: "Murojaat yuborishda maksimal 3 ta foto qo'shishingiz mumkin. Foto muammoni aniq ko'rsatadi va murojaatingizni ishonchli qiladi. Kamera tugmasini bosib fotosuratni yuklang. 📸",
  },
  {
    keywords: ["profil", "profile", "shaxsiy", "hisob"],
    answer: "Profil sahifasida (\"/profile\") siz ko'rishingiz mumkin:\n👤 Shaxsiy ma'lumotlar\n📋 Barcha murojaatlaringiz\n📊 Statistika (jami, hal qilingan, kutilmoqda)\n🏆 Unvon va ball hisobi",
  },
  {
    keywords: ["viloyat", "tuman", "region", "district", "hudud"],
    answer: "Platforma O'zbekistonning barcha viloyatlari va tumanlarini qamrab oladi: Toshkent, Samarqand, Farg'ona, Andijon, Namangan va boshqalar. Har bir murojaat muayyan hudud va ob'ektga bog'lanadi.",
  },
  {
    keywords: ["salom", "hi", "hello", "assalom", "xayr"],
    answer: "Salom! 👋 Men HududInfo.uz yordamchisiman. Sizga quyidagi mavzularda yordam bera olaman:\n• Murojaat yuborish\n• Ball va unvon tizimi\n• Muassasa turlari\n• Statistika va reyting\n\nNimani bilmoqchisiz?",
  },
];

const DEFAULT_ANSWER =
  "Kechirasiz, bu savolga javob topa olmadim 🤔 Murojaat yuborish, ball tizimi, muassasa turlari yoki statistika haqida so'rang — yordam beraman!";

function findAnswer(query: string): string {
  const q = query.toLowerCase();
  for (const qa of QA_BASE) {
    if (qa.keywords.some((kw) => q.includes(kw))) {
      return qa.answer;
    }
  }
  return DEFAULT_ANSWER;
}

// ── Types ──────────────────────────────────────────────────────────────────────

interface Message {
  id: number;
  role: "user" | "bot";
  text: string;
  time: string;
}

function formatTime() {
  return new Date().toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" });
}

// ── Component ──────────────────────────────────────────────────────────────────

export function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      role: "bot",
      text: "Salom! 👋 Men HududInfo.uz yordamchisiman. Murojaat yuborish, reyting, muassasalar yoki boshqa savollaringizga javob bera olaman!",
      time: formatTime(),
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 150);
  }, [open]);

  const sendMessage = () => {
    const text = input.trim();
    if (!text) return;

    const userMsg: Message = { id: Date.now(), role: "user", text, time: formatTime() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    setTimeout(() => {
      const answer = findAnswer(text);
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: "bot", text: answer, time: formatTime() },
      ]);
      setTyping(false);
    }, 600 + Math.random() * 400);
  };

  const QUICK_QUESTIONS = [
    "Murojaat qanday yuboriladi?",
    "Ball tizimi qanday ishlaydi?",
    "Unvonlar haqida",
    "Tekshiruv dasturlari",
  ];

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-24 right-4 md:bottom-6 md:right-6 z-[1700] h-14 w-14 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform"
        style={{
          background: open ? "hsl(215 28% 20%)" : "hsl(221 83% 47%)",
          boxShadow: "0 4px 20px hsl(221 83% 47% / 0.5)",
        }}
        aria-label="Chatbot"
      >
        {open ? (
          <X style={{ width: 22, height: 22, color: "white" }} />
        ) : (
          <MessageCircle style={{ width: 22, height: 22, color: "white" }} />
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div
          className="fixed bottom-40 right-4 md:bottom-24 md:right-6 z-[1700] flex flex-col rounded-2xl overflow-hidden"
          style={{
            width: "min(360px, calc(100vw - 32px))",
            height: "min(500px, calc(100vh - 220px))",
            boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
            border: "1px solid hsl(214 20% 88%)",
            background: "white",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center gap-3 px-4 py-3 shrink-0"
            style={{ background: "hsl(221 83% 47%)" }}
          >
            <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <Bot style={{ width: 16, height: 16, color: "white" }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm leading-none">HududInfo Yordamchi</p>
              <p className="text-white/70 text-[11px] mt-0.5">Onlayn · Tez javob beradi</p>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white transition-colors">
              <X style={{ width: 18, height: 18 }} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3" style={{ background: "hsl(210 22% 97%)" }}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                {/* Avatar */}
                <div
                  className="h-7 w-7 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                  style={{
                    background: msg.role === "bot" ? "hsl(221 83% 47%)" : "hsl(215 28% 20%)",
                  }}
                >
                  {msg.role === "bot" ? (
                    <Bot style={{ width: 13, height: 13, color: "white" }} />
                  ) : (
                    <User style={{ width: 13, height: 13, color: "white" }} />
                  )}
                </div>

                {/* Bubble */}
                <div className={`max-w-[78%] ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col gap-0.5`}>
                  <div
                    className="px-3 py-2 rounded-2xl text-xs leading-relaxed whitespace-pre-line"
                    style={{
                      background: msg.role === "bot" ? "white" : "hsl(221 83% 47%)",
                      color: msg.role === "bot" ? "hsl(215 30% 15%)" : "white",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                      borderRadius: msg.role === "bot" ? "4px 16px 16px 16px" : "16px 4px 16px 16px",
                    }}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-muted-foreground px-1">{msg.time}</span>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {typing && (
              <div className="flex gap-2">
                <div className="h-7 w-7 rounded-full flex items-center justify-center shrink-0" style={{ background: "hsl(221 83% 47%)" }}>
                  <Bot style={{ width: 13, height: 13, color: "white" }} />
                </div>
                <div className="px-3 py-2 bg-white rounded-2xl shadow-sm flex items-center gap-1" style={{ borderRadius: "4px 16px 16px 16px" }}>
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="h-1.5 w-1.5 rounded-full animate-bounce"
                      style={{ background: "hsl(215 14% 60%)", animationDelay: `${i * 150}ms` }}
                    />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick questions */}
          {messages.length <= 1 && (
            <div className="px-3 py-2 flex gap-1.5 flex-wrap shrink-0 border-t border-border/50" style={{ background: "white" }}>
              {QUICK_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => { setInput(q); setTimeout(() => sendMessage(), 10); }}
                  className="px-2.5 py-1 rounded-full text-[11px] font-medium border border-border hover:bg-primary/5 hover:border-primary/30 transition-colors"
                  style={{ color: "hsl(221 83% 47%)" }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    const text = q;
                    const userMsg: Message = { id: Date.now(), role: "user", text, time: formatTime() };
                    setMessages((prev) => [...prev, userMsg]);
                    setTyping(true);
                    setTimeout(() => {
                      setMessages((prev) => [...prev, { id: Date.now() + 1, role: "bot", text: findAnswer(text), time: formatTime() }]);
                      setTyping(false);
                    }, 700);
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="px-3 py-2.5 flex gap-2 shrink-0 border-t border-border/50" style={{ background: "white" }}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Savol yozing..."
              className="flex-1 text-sm px-3 py-2 rounded-xl border border-border outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim()}
              className="h-9 w-9 rounded-xl flex items-center justify-center disabled:opacity-40 active:scale-95 transition-all shrink-0"
              style={{ background: "hsl(221 83% 47%)" }}
            >
              <Send style={{ width: 15, height: 15, color: "white" }} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
