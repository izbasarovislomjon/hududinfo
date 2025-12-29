import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Language = "uz" | "ru" | "cy"; // uz = O'zbek (lotin), ru = Русский, cy = Ўзбек (кирилл)

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}

// Translations
const translations: Record<Language, Record<string, string>> = {
  uz: {
    // Header
    "nav.home": "Bosh sahifa",
    "nav.feedbacks": "Murojaatlar",
    "nav.statistics": "Statistika",
    "nav.news": "Yangiliklar",
    "nav.games": "O'yinlar",
    "nav.budget": "Byudjet",
    "nav.profile": "Profil",
    "nav.my_feedbacks": "Murojaatlarim",
    "nav.login": "Kirish",
    "nav.register": "Ro'yxatdan o'tish",
    "nav.logout": "Chiqish",
    
    // Hero
    "hero.badge": "Davlat xizmatlari platformasi",
    "hero.title": "Hududingiz infratuzilmasini birga yaxshilaymiz",
    "hero.subtitle": "Maktab, bog'cha, poliklinika, suv va yo'llardagi muammolarni bildiring. Sizning ovozingiz muhim!",
    "hero.submit_feedback": "Murojaat yuborish",
    "hero.view_feedbacks": "Murojaatlarni ko'rish",
    "hero.priority_ranking": "Ustuvorlik reytingi",
    
    // Stats
    "stats.total_feedbacks": "Jami murojaatlar",
    "stats.resolved": "Hal qilingan",
    "stats.satisfaction": "Qoniqish darajasi",
    "stats.objects": "Obyektlar",
    
    // Filters
    "filter.search": "Qidirish...",
    "filter.all_districts": "Barcha tumanlar",
    "filter.clear": "Filterni tozalash",
    "filter.found": "ta obyekt topildi",
    "filter.list": "Ro'yxat",
    "filter.map": "Xarita",
    
    // Object types
    "type.school": "Maktab",
    "type.kindergarten": "Bog'cha",
    "type.clinic": "Poliklinika",
    "type.water": "Suv",
    "type.road": "Yo'l",
    
    // Issue types
    "issue.water_supply": "Suv ta'minoti",
    "issue.road_condition": "Yo'l holati",
    "issue.heating": "Isitish tizimi",
    "issue.medical_quality": "Tibbiy xizmat sifati",
    "issue.staff_shortage": "Xodimlar yetishmasligi",
    "issue.infrastructure": "Infratuzilma",
    "issue.other": "Boshqa",
    
    // Status
    "status.submitted": "Yuborildi",
    "status.reviewing": "Ko'rib chiqilmoqda",
    "status.in_progress": "Bajarilmoqda",
    "status.completed": "Bajarildi",
    "status.rejected": "Rad etildi",
    
    // Feedback modal
    "feedback.title": "Murojaat yuborish",
    "feedback.login_required": "Murojaat yuborish uchun tizimga kirishingiz kerak",
    "feedback.description": "Muammoni batafsil tasvirlab, fikringizni bildiring",
    "feedback.issue_type": "Muammo turi",
    "feedback.issue_description": "Muammo tavsifi",
    "feedback.upload_photo": "Rasm yuklash (ixtiyoriy)",
    "feedback.anonymous": "Anonim ravishda yuborish",
    "feedback.your_name": "Ismingiz",
    "feedback.your_phone": "Telefon raqamingiz",
    "feedback.submit": "Yuborish",
    "feedback.success": "Murojaat yuborildi!",
    "feedback.received": "Sizning murojaatingiz qabul qilindi",
    
    // Common
    "common.loading": "Yuklanmoqda...",
    "common.no_data": "Ma'lumot yo'q",
    "common.error": "Xatolik",
    "common.success": "Muvaffaqiyat",
    "common.cancel": "Bekor qilish",
    "common.save": "Saqlash",
    "common.delete": "O'chirish",
    "common.edit": "Tahrirlash",
    "common.view_details": "Batafsil",
    "common.feedback": "Murojaat",
    "common.rating": "Reyting",
    "common.no_rating": "Reyting yo'q",
    "common.votes": "ovoz",
    
    // News
    "news.title": "Yangiliklar",
    "news.subtitle": "Hududlardagi so'nggi o'zgarishlar va yangiliklar",
    "news.all_categories": "Barcha kategoriyalar",
    "news.all_regions": "Barcha hududlar",
    "news.no_news": "Yangiliklar topilmadi",
    "news.read_more": "Davomini o'qish",
    "news.not_found": "Yangilik topilmadi",
    "news.not_found_desc": "Siz izlayotgan yangilik mavjud emas yoki o'chirilgan",
    "news.back_to_list": "Yangiliklarga qaytish",
    
    // Budget
    "budget.title": "Byudjet shaffofligi",
    "budget.subtitle": "Davlat va xususiy mablag'lar sarflanishi",
    "budget.total_allocated": "Jami ajratilgan",
    "budget.total_spent": "Jami sarflangan",
    "budget.projects_count": "Loyihalar soni",
    "budget.all_regions": "Barcha hududlar",
    "budget.all_sectors": "Barcha yo'nalishlar",
    "budget.all_sources": "Barcha manbalar",
    "budget.source.state": "Davlat byudjeti",
    "budget.source.foreign_grant": "Xorijiy grant",
    "budget.source.foreign_credit": "Xorijiy kredit",
    "budget.source.foreign_investment": "Xorijiy investitsiya",
    "budget.source.ppp": "Davlat-xususiy sheriklik",
    
    // Games
    "games.title": "Aqliy o'yinlar",
    "games.subtitle": "O'ynang va aqliy salohiyatingizni oshiring",
    "games.memory": "Xotira o'yini",
    "games.quiz": "Bilimlar bellashuvi",
    "games.leaderboard": "Eng yaxshilar",
    "games.start": "O'yinni boshlash",
    "games.restart": "Qayta boshlash",
    "games.moves": "Harakatlar",
    "games.score": "Ball",
    "games.congratulations": "Tabriklaymiz!",
    "games.you_won": "Siz yutdingiz!",
    "games.test_completed": "Test yakunlandi!",
    "games.question": "Savol",
    "games.no_scores": "Hali hech kim o'ynamagan",
    
    // Profile
    "profile.title": "Profil",
    "profile.my_feedbacks": "Mening murojaatlarim",
    "profile.statistics": "Statistika",
    "profile.edit": "Tahrirlash",
    
    // Auth
    "auth.login": "Tizimga kirish",
    "auth.register": "Ro'yxatdan o'tish",
    "auth.email": "Email",
    "auth.password": "Parol",
    "auth.confirm_password": "Parolni tasdiqlang",
    "auth.full_name": "To'liq ism",
    "auth.forgot_password": "Parolni unutdingizmi?",
    "auth.no_account": "Hisobingiz yo'qmi?",
    "auth.have_account": "Hisobingiz bormi?",
    
    // Object Details
    "object.details": "Batafsil ma'lumot",
    "object.address": "Manzil",
    "object.district": "Tuman",
    "object.region": "Viloyat",
    "object.capacity": "Sig'imi",
    "object.built_year": "Qurilgan yil",
    "object.last_renovation": "Oxirgi ta'mirlash",
    "object.feedbacks": "Murojaatlar",
    "object.reviews": "Sharhlar",
    "object.add_review": "Sharh qoldirish",
    "object.new": "Yangi",
    "object.reconstructed": "Ta'mirlangan",
    
    // Statistics page
    "statistics.title": "Statistika",
    "statistics.subtitle": "Murojaatlar va infratuzilma holati bo'yicha real statistik ma'lumotlar",
    "statistics.issue_types": "Muammo turlari bo'yicha murojaatlar",
    "statistics.status_distribution": "Murojaatlar holati",
    "statistics.by_district": "Tumanlar bo'yicha ob'ektlar",
    "statistics.total_reviews": "Jami sharhlar",
    "statistics.resolution_rate": "Hal qilish darajasi",
    "statistics.solution_ratings": "Yechim baholari",
    
    // Priority page
    "priority.title": "Ustuvorlik reytingi",
    "priority.subtitle": "Eng ko'p ovoz to'plagan murojaatlar",
    "priority.vote": "Ovoz berish",
    "priority.votes": "ovoz",
    
    // Feedbacks page
    "feedbacks.title": "Fuqarolar murojaatlari",
    "feedbacks.subtitle": "Foydalanuvchilar tomonidan yuborilgan murojaatlar",
    "feedbacks.no_feedbacks": "Hali murojaatlar yo'q",
    "feedbacks.no_feedbacks_desc": "Fuqarolar murojaat yuborgandan so'ng bu yerda ko'rinadi",
    "feedbacks.filter_none": "Filtr bo'yicha murojaatlar topilmadi",
    "feedbacks.all": "Barchasi",
  },
  
  ru: {
    // Header
    "nav.home": "Главная",
    "nav.feedbacks": "Обращения",
    "nav.statistics": "Статистика",
    "nav.news": "Новости",
    "nav.games": "Игры",
    "nav.budget": "Бюджет",
    "nav.profile": "Профиль",
    "nav.my_feedbacks": "Мои обращения",
    "nav.login": "Войти",
    "nav.register": "Регистрация",
    "nav.logout": "Выйти",
    
    // Hero
    "hero.badge": "Платформа государственных услуг",
    "hero.title": "Вместе улучшаем инфраструктуру вашего региона",
    "hero.subtitle": "Сообщайте о проблемах в школах, детских садах, поликлиниках, с водой и дорогами. Ваш голос важен!",
    "hero.submit_feedback": "Отправить обращение",
    "hero.view_feedbacks": "Посмотреть обращения",
    "hero.priority_ranking": "Рейтинг приоритетов",
    
    // Stats
    "stats.total_feedbacks": "Всего обращений",
    "stats.resolved": "Решено",
    "stats.satisfaction": "Удовлетворённость",
    "stats.objects": "Объекты",
    
    // Filters
    "filter.search": "Поиск...",
    "filter.all_districts": "Все районы",
    "filter.clear": "Очистить фильтр",
    "filter.found": "объектов найдено",
    "filter.list": "Список",
    "filter.map": "Карта",
    
    // Object types
    "type.school": "Школа",
    "type.kindergarten": "Детский сад",
    "type.clinic": "Поликлиника",
    "type.water": "Вода",
    "type.road": "Дорога",
    
    // Issue types
    "issue.water_supply": "Водоснабжение",
    "issue.road_condition": "Состояние дорог",
    "issue.heating": "Отопление",
    "issue.medical_quality": "Качество мед. услуг",
    "issue.staff_shortage": "Нехватка кадров",
    "issue.infrastructure": "Инфраструктура",
    "issue.other": "Другое",
    
    // Status
    "status.submitted": "Отправлено",
    "status.reviewing": "На рассмотрении",
    "status.in_progress": "В работе",
    "status.completed": "Выполнено",
    "status.rejected": "Отклонено",
    
    // Feedback modal
    "feedback.title": "Отправить обращение",
    "feedback.login_required": "Для отправки обращения необходимо войти в систему",
    "feedback.description": "Подробно опишите проблему",
    "feedback.issue_type": "Тип проблемы",
    "feedback.issue_description": "Описание проблемы",
    "feedback.upload_photo": "Загрузить фото (необязательно)",
    "feedback.anonymous": "Отправить анонимно",
    "feedback.your_name": "Ваше имя",
    "feedback.your_phone": "Ваш телефон",
    "feedback.submit": "Отправить",
    "feedback.success": "Обращение отправлено!",
    "feedback.received": "Ваше обращение принято",
    
    // Common
    "common.loading": "Загрузка...",
    "common.no_data": "Нет данных",
    "common.error": "Ошибка",
    "common.success": "Успешно",
    "common.cancel": "Отмена",
    "common.save": "Сохранить",
    "common.delete": "Удалить",
    "common.edit": "Редактировать",
    "common.view_details": "Подробнее",
    "common.feedback": "Обращение",
    "common.rating": "Рейтинг",
    "common.no_rating": "Нет рейтинга",
    "common.votes": "голосов",
    
    // News
    "news.title": "Новости",
    "news.subtitle": "Последние изменения и новости регионов",
    "news.all_categories": "Все категории",
    "news.all_regions": "Все регионы",
    "news.no_news": "Новостей не найдено",
    "news.read_more": "Читать далее",
    "news.not_found": "Новость не найдена",
    "news.not_found_desc": "Искомая новость не существует или была удалена",
    "news.back_to_list": "Вернуться к новостям",
    
    // Budget
    "budget.title": "Прозрачность бюджета",
    "budget.subtitle": "Расходование государственных и частных средств",
    "budget.total_allocated": "Всего выделено",
    "budget.total_spent": "Всего потрачено",
    "budget.projects_count": "Количество проектов",
    "budget.all_regions": "Все регионы",
    "budget.all_sectors": "Все направления",
    "budget.all_sources": "Все источники",
    "budget.source.state": "Госбюджет",
    "budget.source.foreign_grant": "Иностранный грант",
    "budget.source.foreign_credit": "Иностранный кредит",
    "budget.source.foreign_investment": "Иностранные инвестиции",
    "budget.source.ppp": "ГЧП",
    
    // Games
    "games.title": "Интеллектуальные игры",
    "games.subtitle": "Играйте и развивайте свои способности",
    "games.memory": "Игра на память",
    "games.quiz": "Викторина",
    "games.leaderboard": "Лидеры",
    "games.start": "Начать игру",
    "games.restart": "Начать заново",
    "games.moves": "Ходы",
    "games.score": "Очки",
    "games.congratulations": "Поздравляем!",
    "games.you_won": "Вы выиграли!",
    "games.test_completed": "Тест завершён!",
    "games.question": "Вопрос",
    "games.no_scores": "Пока никто не играл",
    
    // Profile
    "profile.title": "Профиль",
    "profile.my_feedbacks": "Мои обращения",
    "profile.statistics": "Статистика",
    "profile.edit": "Редактировать",
    
    // Auth
    "auth.login": "Вход в систему",
    "auth.register": "Регистрация",
    "auth.email": "Email",
    "auth.password": "Пароль",
    "auth.confirm_password": "Подтвердите пароль",
    "auth.full_name": "Полное имя",
    "auth.forgot_password": "Забыли пароль?",
    "auth.no_account": "Нет аккаунта?",
    "auth.have_account": "Уже есть аккаунт?",
    
    // Object Details
    "object.details": "Подробная информация",
    "object.address": "Адрес",
    "object.district": "Район",
    "object.region": "Область",
    "object.capacity": "Вместимость",
    "object.built_year": "Год постройки",
    "object.last_renovation": "Последний ремонт",
    "object.feedbacks": "Обращения",
    "object.reviews": "Отзывы",
    "object.add_review": "Оставить отзыв",
    "object.new": "Новый",
    "object.reconstructed": "Отремонтирован",
    
    // Statistics page
    "statistics.title": "Статистика",
    "statistics.subtitle": "Реальные статистические данные по обращениям и инфраструктуре",
    "statistics.issue_types": "Обращения по типам проблем",
    "statistics.status_distribution": "Статус обращений",
    "statistics.by_district": "Объекты по районам",
    "statistics.total_reviews": "Всего отзывов",
    "statistics.resolution_rate": "Процент решения",
    "statistics.solution_ratings": "Оценки решений",
    
    // Priority page
    "priority.title": "Рейтинг приоритетов",
    "priority.subtitle": "Обращения с наибольшим количеством голосов",
    "priority.vote": "Голосовать",
    "priority.votes": "голосов",
    
    // Feedbacks page
    "feedbacks.title": "Обращения граждан",
    "feedbacks.subtitle": "Обращения, отправленные пользователями",
    "feedbacks.no_feedbacks": "Обращений пока нет",
    "feedbacks.no_feedbacks_desc": "Обращения появятся здесь после их отправки гражданами",
    "feedbacks.filter_none": "Обращений по фильтру не найдено",
    "feedbacks.all": "Все",
  },
  
  cy: {
    // Header - Cyrillic Uzbek
    "nav.home": "Бош саҳифа",
    "nav.feedbacks": "Мурожаатлар",
    "nav.statistics": "Статистика",
    "nav.news": "Янгиликлар",
    "nav.games": "Ўйинлар",
    "nav.budget": "Бюджет",
    "nav.profile": "Профил",
    "nav.my_feedbacks": "Мурожаатларим",
    "nav.login": "Кириш",
    "nav.register": "Рўйхатдан ўтиш",
    "nav.logout": "Чиқиш",
    
    // Hero
    "hero.badge": "Давлат хизматлари платформаси",
    "hero.title": "Ҳудудингиз инфратузилмасини бирга яхшилаймиз",
    "hero.subtitle": "Мактаб, боғча, поликлиника, сув ва йўллардаги муаммоларни билдиринг. Сизнинг овозингиз муҳим!",
    "hero.submit_feedback": "Мурожаат юбориш",
    "hero.view_feedbacks": "Мурожаатларни кўриш",
    "hero.priority_ranking": "Устуворлик рейтинги",
    
    // Stats
    "stats.total_feedbacks": "Жами мурожаатлар",
    "stats.resolved": "Ҳал қилинган",
    "stats.satisfaction": "Қониқиш даражаси",
    "stats.objects": "Объектлар",
    
    // Filters
    "filter.search": "Қидириш...",
    "filter.all_districts": "Барча туманлар",
    "filter.clear": "Филтрни тозалаш",
    "filter.found": "та объект топилди",
    "filter.list": "Рўйхат",
    "filter.map": "Харита",
    
    // Object types
    "type.school": "Мактаб",
    "type.kindergarten": "Боғча",
    "type.clinic": "Поликлиника",
    "type.water": "Сув",
    "type.road": "Йўл",
    
    // Issue types
    "issue.water_supply": "Сув таъминоти",
    "issue.road_condition": "Йўл ҳолати",
    "issue.heating": "Иситиш тизими",
    "issue.medical_quality": "Тиббий хизмат сифати",
    "issue.staff_shortage": "Ходимлар етишмаслиги",
    "issue.infrastructure": "Инфратузилма",
    "issue.other": "Бошқа",
    
    // Status
    "status.submitted": "Юборилди",
    "status.reviewing": "Кўриб чиқилмоқда",
    "status.in_progress": "Бажарилмоқда",
    "status.completed": "Бажарилди",
    "status.rejected": "Рад этилди",
    
    // Feedback modal
    "feedback.title": "Мурожаат юбориш",
    "feedback.login_required": "Мурожаат юбориш учун тизимга киришингиз керак",
    "feedback.description": "Муаммони батафсил тасвирлаб, фикрингизни билдиринг",
    "feedback.issue_type": "Муаммо тури",
    "feedback.issue_description": "Муаммо тавсифи",
    "feedback.upload_photo": "Расм юклаш (ихтиёрий)",
    "feedback.anonymous": "Аноним равишда юбориш",
    "feedback.your_name": "Исмингиз",
    "feedback.your_phone": "Телефон рақамингиз",
    "feedback.submit": "Юбориш",
    "feedback.success": "Мурожаат юборилди!",
    "feedback.received": "Сизнинг мурожаатингиз қабул қилинди",
    
    // Common
    "common.loading": "Юкланмоқда...",
    "common.no_data": "Маълумот йўқ",
    "common.error": "Хатолик",
    "common.success": "Муваффақият",
    "common.cancel": "Бекор қилиш",
    "common.save": "Сақлаш",
    "common.delete": "Ўчириш",
    "common.edit": "Таҳрирлаш",
    "common.view_details": "Батафсил",
    "common.feedback": "Мурожаат",
    "common.rating": "Рейтинг",
    "common.no_rating": "Рейтинг йўқ",
    "common.votes": "овоз",
    
    // News
    "news.title": "Янгиликлар",
    "news.subtitle": "Ҳудудлардаги сўнгги ўзгаришлар ва янгиликлар",
    "news.all_categories": "Барча категориялар",
    "news.all_regions": "Барча ҳудудлар",
    "news.no_news": "Янгиликлар топилмади",
    "news.read_more": "Давомини ўқиш",
    "news.not_found": "Янгилик топилмади",
    "news.not_found_desc": "Сиз излаётган янгилик мавжуд эмас ёки ўчирилган",
    "news.back_to_list": "Янгиликларга қайтиш",
    
    // Budget
    "budget.title": "Бюджет шаффофлиги",
    "budget.subtitle": "Давлат ва хусусий маблағлар сарфланиши",
    "budget.total_allocated": "Жами ажратилган",
    "budget.total_spent": "Жами сарфланган",
    "budget.projects_count": "Лойиҳалар сони",
    "budget.all_regions": "Барча ҳудудлар",
    "budget.all_sectors": "Барча йўналишлар",
    "budget.all_sources": "Барча манбалар",
    "budget.source.state": "Давлат бюджети",
    "budget.source.foreign_grant": "Хорижий грант",
    "budget.source.foreign_credit": "Хорижий кредит",
    "budget.source.foreign_investment": "Хорижий инвестиция",
    "budget.source.ppp": "Давлат-хусусий шериклик",
    
    // Games
    "games.title": "Ақлий ўйинлар",
    "games.subtitle": "Ўйнанг ва ақлий салоҳиятингизни оширинг",
    "games.memory": "Хотира ўйини",
    "games.quiz": "Билимлар беллашуви",
    "games.leaderboard": "Энг яхшилар",
    "games.start": "Ўйинни бошлаш",
    "games.restart": "Қайта бошлаш",
    "games.moves": "Ҳаракатлар",
    "games.score": "Балл",
    "games.congratulations": "Табриклаймиз!",
    "games.you_won": "Сиз ютдингиз!",
    "games.test_completed": "Тест якунланди!",
    "games.question": "Савол",
    "games.no_scores": "Ҳали ҳеч ким ўйнамаган",
    
    // Profile
    "profile.title": "Профил",
    "profile.my_feedbacks": "Менинг мурожаатларим",
    "profile.statistics": "Статистика",
    "profile.edit": "Таҳрирлаш",
    
    // Auth
    "auth.login": "Тизимга кириш",
    "auth.register": "Рўйхатдан ўтиш",
    "auth.email": "Email",
    "auth.password": "Парол",
    "auth.confirm_password": "Паролни тасдиқланг",
    "auth.full_name": "Тўлиқ исм",
    "auth.forgot_password": "Паролни унутдингизми?",
    "auth.no_account": "Ҳисобингиз йўқми?",
    "auth.have_account": "Ҳисобингиз борми?",
    
    // Object Details
    "object.details": "Батафсил маълумот",
    "object.address": "Манзил",
    "object.district": "Туман",
    "object.region": "Вилоят",
    "object.capacity": "Сиғими",
    "object.built_year": "Қурилган йил",
    "object.last_renovation": "Охирги таъмирлаш",
    "object.feedbacks": "Мурожаатлар",
    "object.reviews": "Шарҳлар",
    "object.add_review": "Шарҳ қолдириш",
    "object.new": "Янги",
    "object.reconstructed": "Таъмирланган",
    
    // Statistics page
    "statistics.title": "Статистика",
    "statistics.subtitle": "Мурожаатлар ва инфратузилма ҳолати бўйича реал статистик маълумотлар",
    "statistics.issue_types": "Муаммо турлари бўйича мурожаатлар",
    "statistics.status_distribution": "Мурожаатлар ҳолати",
    "statistics.by_district": "Туманлар бўйича объектлар",
    "statistics.total_reviews": "Жами шарҳлар",
    "statistics.resolution_rate": "Ҳал қилиш даражаси",
    "statistics.solution_ratings": "Ечим баҳолари",
    
    // Priority page
    "priority.title": "Устуворлик рейтинги",
    "priority.subtitle": "Энг кўп овоз тўплаган мурожаатлар",
    "priority.vote": "Овоз бериш",
    "priority.votes": "овоз",
    
    // Feedbacks page
    "feedbacks.title": "Фуқаролар мурожаатлари",
    "feedbacks.subtitle": "Фойдаланувчилар томонидан юборилган мурожаатлар",
    "feedbacks.no_feedbacks": "Ҳали мурожаатлар йўқ",
    "feedbacks.no_feedbacks_desc": "Фуқаролар мурожаат юборгандан сўнг бу ерда кўринади",
    "feedbacks.filter_none": "Филтр бўйича мурожаатлар топилмади",
    "feedbacks.all": "Барчаси",
  },
};

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("hududinfo_language");
    return (saved as Language) || "uz";
  });

  useEffect(() => {
    localStorage.setItem("hududinfo_language", language);
    document.documentElement.lang = language === "cy" ? "uz-Cyrl" : language;
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}
