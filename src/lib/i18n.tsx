import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "ar" | "en" | "fr" | "tr";
export const LANGS: { code: Lang; label: string }[] = [
  { code: "ar", label: "العربية" },
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
  { code: "tr", label: "Türkçe" },
];

// key: [ar, en, fr, tr]
const D = {
  brand: ["درموش تي في", "DRMOSH TV", "DRMOSH TV", "DRMOSH TV"],
  tagline: ["عالم من المسلسلات المصنوعة بالذكاء الاصطناعي", "A world of AI-made series", "Un monde de séries créées par l'IA", "Yapay zekâ ile üretilmiş diziler dünyası"],
  home: ["الرئيسية", "Home", "Accueil", "Ana Sayfa"],
  browse: ["تصفح", "Browse", "Parcourir", "Göz At"],
  search: ["بحث", "Search", "Recherche", "Ara"],
  searchPlaceholder: ["ابحث عن مسلسل، حلقة، نوع أو كلمة...", "Search series, episodes, genres, keywords...", "Rechercher séries, épisodes, genres...", "Dizi, bölüm, tür veya anahtar kelime ara..."],
  signIn: ["تسجيل الدخول", "Sign in", "Se connecter", "Giriş yap"],
  signUp: ["إنشاء حساب", "Create account", "Créer un compte", "Hesap oluştur"],
  signOut: ["تسجيل الخروج", "Sign out", "Se déconnecter", "Çıkış yap"],
  account: ["حسابي", "My account", "Mon compte", "Hesabım"],
  watchNow: ["شاهد الآن", "Watch now", "Regarder", "Şimdi izle"],
  moreInfo: ["التفاصيل", "Details", "Détails", "Detaylar"],
  addWatchlist: ["أضف إلى قائمتي", "Add to my list", "Ajouter à ma liste", "Listeme ekle"],
  inWatchlist: ["في قائمتي", "In my list", "Dans ma liste", "Listemde"],
  latest: ["أحدث الإصدارات", "Latest releases", "Dernières sorties", "Son çıkanlar"],
  trending: ["الأكثر رواجاً", "Trending now", "Tendances", "Trend olanlar"],
  popular: ["الأكثر مشاهدة", "Most popular", "Les plus populaires", "En popüler"],
  recent_episodes: ["حلقات أضيفت مؤخراً", "Recently added episodes", "Épisodes récents", "Yeni eklenen bölümler"],
  recommended: ["مقترح لك", "Recommended for you", "Recommandé pour vous", "Sizin için önerilenler"],
  originals: ["إنتاجات درموش الأصلية", "DRMOSH TV Originals", "Originaux DRMOSH TV", "DRMOSH TV Orijinalleri"],
  genres: ["التصنيفات", "Genres", "Genres", "Türler"],
  continueWatching: ["تابع المشاهدة", "Continue watching", "Reprendre", "İzlemeye devam et"],
  emptyCatalog: ["لا يوجد محتوى منشور بعد. ترقّبوا أولى إنتاجاتنا قريباً.", "No published content yet. Our first productions are coming soon.", "Aucun contenu publié pour l'instant. Nos premières productions arrivent bientôt.", "Henüz yayınlanmış içerik yok. İlk yapımlarımız yakında."],
  status_upcoming: ["قريباً", "Coming soon", "Bientôt", "Yakında"],
  status_ongoing: ["مستمر", "Ongoing", "En cours", "Devam ediyor"],
  status_completed: ["مكتمل", "Completed", "Terminé", "Tamamlandı"],
  available: ["متاح", "Available", "Disponible", "Mevcut"],
  seasons: ["المواسم", "Seasons", "Saisons", "Sezonlar"],
  season: ["الموسم", "Season", "Saison", "Sezon"],
  episodes: ["الحلقات", "Episodes", "Épisodes", "Bölümler"],
  episode: ["الحلقة", "Episode", "Épisode", "Bölüm"],
  cast: ["طاقم العمل والشخصيات", "Cast & characters", "Distribution & personnages", "Oyuncular ve karakterler"],
  trailer: ["الإعلان الرسمي", "Trailer", "Bande-annonce", "Fragman"],
  related: ["أعمال مشابهة", "Related series", "Séries similaires", "Benzer diziler"],
  relatedEpisodes: ["حلقات أخرى", "More episodes", "Autres épisodes", "Diğer bölümler"],
  synopsis: ["القصة", "Synopsis", "Synopsis", "Özet"],
  year: ["سنة الإصدار", "Release year", "Année", "Yıl"],
  status: ["الحالة", "Status", "Statut", "Durum"],
  production: ["الإنتاج", "Production", "Production", "Yapım"],
  noEpisodes: ["لا توجد حلقات منشورة بعد.", "No published episodes yet.", "Aucun épisode publié.", "Henüz yayınlanmış bölüm yok."],
  next: ["الحلقة التالية", "Next episode", "Épisode suivant", "Sonraki bölüm"],
  prev: ["الحلقة السابقة", "Previous episode", "Épisode précédent", "Önceki bölüm"],
  noVideo: ["الفيديو غير متوفر حالياً.", "Video not available yet.", "Vidéo indisponible.", "Video henüz mevcut değil."],
  min: ["دقيقة", "min", "min", "dk"],
  allGenres: ["كل التصنيفات", "All genres", "Tous les genres", "Tüm türler"],
  sort: ["الترتيب", "Sort", "Trier", "Sırala"],
  sortNewest: ["الأحدث", "Newest", "Plus récents", "En yeni"],
  sortPopular: ["الأكثر مشاهدة", "Most viewed", "Plus vus", "En çok izlenen"],
  sortTitle: ["الاسم", "Title", "Titre", "Ad"],
  sortYear: ["سنة الإصدار", "Release year", "Année", "Yıl"],
  results: ["النتائج", "Results", "Résultats", "Sonuçlar"],
  noResults: ["لا توجد نتائج مطابقة.", "No matching results.", "Aucun résultat.", "Sonuç bulunamadı."],
  email: ["البريد الإلكتروني", "Email", "E-mail", "E-posta"],
  password: ["كلمة المرور", "Password", "Mot de passe", "Şifre"],
  newPassword: ["كلمة المرور الجديدة", "New password", "Nouveau mot de passe", "Yeni şifre"],
  displayName: ["الاسم المعروض", "Display name", "Nom affiché", "Görünen ad"],
  firstSetup: ["أول مرة؟ أنشئ حساب المدير", "First time? Create admin account", "Première fois ? Créer le compte admin", "İlk kez mi? Yönetici hesabı oluştur"],
  createAdmin: ["إنشاء الحساب والدخول", "Create account & sign in", "Créer le compte et se connecter", "Hesap oluştur ve giriş yap"],
  forgot: ["نسيت كلمة المرور؟", "Forgot password?", "Mot de passe oublié ?", "Şifremi unuttum"],
  sendReset: ["إرسال رابط الاستعادة", "Send reset link", "Envoyer le lien", "Sıfırlama bağlantısı gönder"],
  resetSent: ["تم إرسال رابط الاستعادة إلى بريدك.", "Reset link sent to your email.", "Lien envoyé par e-mail.", "Sıfırlama bağlantısı gönderildi."],
  checkEmail: ["تحقق من بريدك لتأكيد الحساب.", "Check your email to confirm your account.", "Vérifiez votre e-mail pour confirmer.", "Hesabını onaylamak için e-postanı kontrol et."],
  google: ["المتابعة باستخدام Google", "Continue with Google", "Continuer avec Google", "Google ile devam et"],
  or: ["أو", "or", "ou", "veya"],
  haveAccount: ["لديك حساب؟ سجّل الدخول", "Have an account? Sign in", "Déjà un compte ? Connexion", "Hesabın var mı? Giriş yap"],
  noAccount: ["ليس لديك حساب؟ أنشئ حساباً", "No account? Create one", "Pas de compte ? Inscrivez-vous", "Hesabın yok mu? Oluştur"],
  backToSignIn: ["العودة لتسجيل الدخول", "Back to sign in", "Retour à la connexion", "Girişe dön"],
  updatePassword: ["تحديث كلمة المرور", "Update password", "Mettre à jour", "Şifreyi güncelle"],
  passwordUpdated: ["تم تحديث كلمة المرور.", "Password updated.", "Mot de passe mis à jour.", "Şifre güncellendi."],
  profile: ["الملف الشخصي", "Profile", "Profil", "Profil"],
  watchlist: ["قائمتي", "My list", "Ma liste", "Listem"],
  history: ["سجل المشاهدة", "Viewing history", "Historique", "İzleme geçmişi"],
  save: ["حفظ", "Save", "Enregistrer", "Kaydet"],
  saved: ["تم الحفظ", "Saved", "Enregistré", "Kaydedildi"],
  cancel: ["إلغاء", "Cancel", "Annuler", "İptal"],
  delete: ["حذف", "Delete", "Supprimer", "Sil"],
  edit: ["تعديل", "Edit", "Modifier", "Düzenle"],
  add: ["إضافة", "Add", "Ajouter", "Ekle"],
  confirmDelete: ["هل أنت متأكد؟ لا يمكن التراجع عن هذا الإجراء.", "Are you sure? This cannot be undone.", "Êtes-vous sûr ? Action irréversible.", "Emin misin? Bu işlem geri alınamaz."],
  empty: ["لا يوجد شيء هنا بعد.", "Nothing here yet.", "Rien pour l'instant.", "Henüz bir şey yok."],
  error: ["حدث خطأ", "Something went wrong", "Une erreur est survenue", "Bir hata oluştu"],
  suspended: ["تم إيقاف حسابك. تواصل مع الإدارة.", "Your account is suspended.", "Votre compte est suspendu.", "Hesabın askıya alındı."],
  language: ["اللغة", "Language", "Langue", "Dil"],
  contact: ["تواصل معنا", "Contact", "Contact", "İletişim"],
  rights: ["جميع الحقوق محفوظة", "All rights reserved", "Tous droits réservés", "Tüm hakları saklıdır"],
  footerNote: ["كل المحتوى على المنصة مملوك لدرموش تي في أو مرخّص لها.", "All content is owned by or licensed to DRMOSH TV.", "Tout le contenu appartient à DRMOSH TV ou est sous licence.", "Tüm içerik DRMOSH TV'ye aittir veya lisanslıdır."],
  original: ["أصلي", "Original", "Original", "Orijinal"],
  views: ["مشاهدة", "views", "vues", "izlenme"],
  // admin
  adm_title: ["لوحة الإدارة", "Admin dashboard", "Administration", "Yönetim paneli"],
  adm_overview: ["نظرة عامة", "Overview", "Vue d'ensemble", "Genel bakış"],
  adm_series: ["المسلسلات", "Series", "Séries", "Diziler"],
  adm_episodes: ["الحلقات", "Episodes", "Épisodes", "Bölümler"],
  adm_home: ["الصفحة الرئيسية", "Homepage", "Accueil", "Ana sayfa"],
  adm_users: ["المستخدمون", "Users", "Utilisateurs", "Kullanıcılar"],
  adm_analytics: ["الإحصائيات", "Analytics", "Statistiques", "Analitik"],
  adm_settings: ["الإعدادات", "Settings", "Paramètres", "Ayarlar"],
  adm_totalSeries: ["إجمالي المسلسلات", "Total series", "Total séries", "Toplam dizi"],
  adm_totalEpisodes: ["إجمالي الحلقات", "Total episodes", "Total épisodes", "Toplam bölüm"],
  adm_totalUsers: ["إجمالي المستخدمين", "Total users", "Total utilisateurs", "Toplam kullanıcı"],
  adm_totalViews: ["إجمالي المشاهدات", "Total views", "Total vues", "Toplam izlenme"],
  adm_recent: ["أضيف مؤخراً", "Recently added", "Ajouts récents", "Son eklenenler"],
  adm_activity: ["نشاط المنصة (آخر 30 يوماً)", "Platform activity (last 30 days)", "Activité (30 jours)", "Platform etkinliği (30 gün)"],
  adm_newSeries: ["مسلسل جديد", "New series", "Nouvelle série", "Yeni dizi"],
  adm_newEpisode: ["حلقة جديدة", "New episode", "Nouvel épisode", "Yeni bölüm"],
  f_title: ["العنوان", "Title", "Titre", "Başlık"],
  f_slug: ["الرابط المختصر (لاتيني)", "URL slug", "Slug URL", "URL kısa adı"],
  f_synopsis: ["الوصف", "Description", "Description", "Açıklama"],
  f_poster: ["الملصق", "Poster", "Affiche", "Afiş"],
  f_cover: ["صورة الغلاف", "Cover image", "Image de couverture", "Kapak görseli"],
  f_trailer: ["رابط الإعلان", "Trailer URL", "URL bande-annonce", "Fragman URL"],
  f_releaseDate: ["تاريخ الإصدار", "Release date", "Date de sortie", "Çıkış tarihi"],
  f_keywords: ["كلمات مفتاحية", "Keywords", "Mots-clés", "Anahtar kelimeler"],
  f_cast: ["طاقم العمل (سطر لكل ممثل: الاسم - الشخصية)", "Cast (one per line: Name - Character)", "Distribution (une ligne : Nom - Rôle)", "Oyuncular (satır başına: Ad - Karakter)"],
  f_published: ["منشور", "Published", "Publié", "Yayında"],
  f_draft: ["مسودة", "Draft", "Brouillon", "Taslak"],
  f_trending: ["ضمن الرائج", "Trending", "Tendance", "Trend"],
  f_latest: ["ضمن أحدث الإصدارات", "Latest release", "Dernière sortie", "Son çıkan"],
  f_original: ["إنتاج أصلي", "Original production", "Production originale", "Orijinal yapım"],
  f_upload: ["رفع صورة", "Upload image", "Téléverser", "Görsel yükle"],
  f_uploading: ["جارٍ الرفع...", "Uploading...", "Téléversement...", "Yükleniyor..."],
  f_imageUrl: ["رابط الصورة الخارجي", "External image URL", "URL externe de l’image", "Harici görsel URL’si"],
  f_applyUrl: ["اعتماد الرابط", "Apply URL", "Appliquer l’URL", "URL’yi uygula"],
  f_invalidImageUrl: ["أدخل رابط صورة صالحاً يبدأ بـ https://", "Enter a valid HTTPS image URL", "Saisissez une URL d’image HTTPS valide", "Geçerli bir HTTPS görsel URL’si girin"],
  f_imageUnavailable: ["تعذر تحميل الصورة", "Image could not be loaded", "Impossible de charger l’image", "Görsel yüklenemedi"],
  f_seriesPick: ["المسلسل", "Series", "Série", "Dizi"],
  f_seasonNumber: ["رقم الموسم", "Season number", "N° saison", "Sezon no"],
  f_episodeNumber: ["رقم الحلقة", "Episode number", "N° épisode", "Bölüm no"],
  f_thumbnail: ["الصورة المصغرة", "Thumbnail", "Miniature", "Küçük resim"],
  f_videoUrl: ["رابط الفيديو (MP4 أو YouTube أو Vimeo)", "Video URL (MP4, YouTube or Vimeo)", "URL vidéo (MP4, YouTube, Vimeo)", "Video URL (MP4, YouTube, Vimeo)"],
  f_duration: ["المدة بالدقائق", "Duration (min)", "Durée (min)", "Süre (dk)"],
  f_publishAt: ["موعد النشر", "Publish at", "Publier le", "Yayın zamanı"],
  f_scheduled: ["مجدول", "Scheduled", "Programmé", "Planlandı"],
  adm_featured: ["المسلسل المميز في الواجهة", "Featured hero series", "Série en vedette", "Öne çıkan dizi"],
  adm_sectionOrder: ["ترتيب أقسام الصفحة الرئيسية", "Homepage section order", "Ordre des sections", "Bölüm sırası"],
  adm_none: ["بدون", "None", "Aucun", "Yok"],
  adm_role: ["الدور", "Role", "Rôle", "Rol"],
  adm_suspend: ["إيقاف", "Suspend", "Suspendre", "Askıya al"],
  adm_unsuspend: ["إلغاء الإيقاف", "Reactivate", "Réactiver", "Etkinleştir"],
  adm_makeAdmin: ["منح صلاحية مدير", "Make admin", "Rendre admin", "Yönetici yap"],
  adm_removeAdmin: ["سحب صلاحية المدير", "Remove admin", "Retirer admin", "Yöneticiliği kaldır"],
  adm_joined: ["تاريخ التسجيل", "Joined", "Inscrit le", "Katılım"],
  adm_mostSeries: ["المسلسلات الأكثر مشاهدة", "Most watched series", "Séries les plus vues", "En çok izlenen diziler"],
  adm_mostEpisodes: ["الحلقات الأكثر مشاهدة", "Most watched episodes", "Épisodes les plus vus", "En çok izlenen bölümler"],
  adm_monthly: ["النشاط الشهري", "Monthly activity", "Activité mensuelle", "Aylık etkinlik"],
  adm_daily: ["النشاط اليومي", "Daily activity", "Activité quotidienne", "Günlük etkinlik"],
  s_siteName: ["اسم المنصة", "Platform name", "Nom de la plateforme", "Platform adı"],
  s_siteDesc: ["وصف المنصة", "Platform description", "Description", "Platform açıklaması"],
  s_seoTitle: ["عنوان SEO", "SEO title", "Titre SEO", "SEO başlığı"],
  s_seoDesc: ["وصف SEO", "SEO description", "Description SEO", "SEO açıklaması"],
  s_ogImage: ["صورة المشاركة", "Share image", "Image de partage", "Paylaşım görseli"],
  s_social: ["روابط التواصل الاجتماعي", "Social links", "Réseaux sociaux", "Sosyal medya"],
  s_contactEmail: ["بريد التواصل", "Contact email", "E-mail de contact", "İletişim e-postası"],
  s_contactPhone: ["هاتف التواصل", "Contact phone", "Téléphone", "Telefon"],
  s_announcements: ["الإعلانات", "Announcements", "Annonces", "Duyurular"],
  s_newAnnouncement: ["نص إعلان جديد", "New announcement text", "Nouvelle annonce", "Yeni duyuru"],
  s_active: ["فعّال", "Active", "Active", "Aktif"],
  forbidden: ["غير مصرح", "Not authorized", "Non autorisé", "Yetkisiz"],
} as const;

export type TKey = keyof typeof D;
const IDX: Record<Lang, number> = { ar: 0, en: 1, fr: 2, tr: 3 };

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (k: TKey) => string; dir: "rtl" | "ltr" };
const I18nCtx = createContext<Ctx | null>(null);

export function translate(lang: Lang, k: TKey) {
  const row = D[k] as readonly string[];
  return row[IDX[lang]] ?? row[0] ?? k;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ar");
  useEffect(() => {
    const saved = window.localStorage.getItem("drmosh-lang") as Lang | null;
    if (saved && saved in IDX) setLangState(saved);
  }, []);
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);
  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    window.localStorage.setItem("drmosh-lang", l);
  }, []);
  const t = useCallback((k: TKey) => translate(lang, k), [lang]);
  return <I18nCtx.Provider value={{ lang, setLang, t, dir: lang === "ar" ? "rtl" : "ltr" }}>{children}</I18nCtx.Provider>;
}

export function useI18n() {
  const c = useContext(I18nCtx);
  if (!c) throw new Error("useI18n outside provider");
  return c;
}

export function genreName(g: { name_ar: string; name_en: string; name_fr: string; name_tr: string }, lang: Lang) {
  return g[`name_${lang}`];
}
