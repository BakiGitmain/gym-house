"use client";

import Link from "next/link";
import {
  useRouter,
} from "next/navigation";
import {
  useEffect,
  useState,
  type FormEvent,
} from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Clock3,
  LoaderCircle,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  UserCheck,
  Users,
  UserX,
  X,
} from "lucide-react";

import CustomerFormModal from "@/components/admin/customer-form-modal";
import { useAuth } from "@/components/providers/auth-provider";
import { useLanguage } from "@/components/providers/language-provider";
import {
  AuthApiError,
} from "@/lib/auth-api";
import {
  deleteAdminCustomer,
  getAdminCustomers,
  type AdminCustomer,
  type CustomerPagination,
  type CustomerStatus,
  type CustomerStatusFilter,
  type CustomerSummary,
} from "@/lib/admin-customers-api";

type DashboardLanguage =
  | "en"
  | "am";

type ModalState =
  | {
      type: "create";
      customer: null;
    }
  | {
      type: "edit";
      customer: AdminCustomer;
    }
  | null;

const emptySummary:
  CustomerSummary = {
    totalCustomers: 0,
    activeMemberships: 0,
    expiringMemberships: 0,
    disabledAccounts: 0,
  };

const emptyPagination:
  CustomerPagination = {
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1,
  };

const copy = {
  en: {
    back: "Back to website",
    eyebrow: "Customer management",
    title: "Admin dashboard",

    description:
      "Create customer accounts, control access, and manage every Gym House membership.",

    addCustomer: "Add customer",

    total: "Total customers",
    active: "Active memberships",
    expiring: "Expiring soon",
    disabled: "Disabled accounts",

    searchPlaceholder:
      "Search name, username, or email",

    search: "Search",
    allStatuses: "All statuses",

    tableCustomer: "Customer",
    tableMembership: "Membership",
    tableAccess: "Access",
    tableLastLogin: "Last login",
    tableAction: "Actions",

    enabled: "Enabled",
    disabledStatus: "Disabled",
    never: "Never",
    noMembership: "No membership",
    remaining: "days remaining",

    emptyTitle:
      "No customers found",

    emptyDescription:
      "Add your first customer or change the current search filters.",

    previous: "Previous",
    next: "Next",
    page: "Page",

    loadingTitle:
      "Preparing dashboard",

    loadingDescription:
      "Loading customer data and profile images...",

    refreshing:
      "Refreshing customers...",

    redirecting:
      "Redirecting...",

    deleteTitle:
      "Delete customer?",

    deleteDescription:
      "This permanently removes the account, membership records, active sessions, and profile image. This action cannot be undone.",

    deleteCustomer:
      "Yes",

    keepCustomer:
      "No",

    deleting:
      "Deleting customer...",

    closeDialog:
      "Close confirmation",

    editCustomer:
      "Edit customer",

    deleteCustomerAction:
      "Delete customer",

    status: {
      all: "All",
      active: "Active",
      expiring: "Expiring",
      expired: "Expired",
      scheduled: "Scheduled",
      paused: "Paused",
      cancelled: "Cancelled",
      inactive: "No membership",
      disabled: "Disabled",
    },

    unknownError:
      "Unable to load customers. Try again.",

    unknownDeleteError:
      "Unable to delete this customer. Try again.",
  },

  am: {
    back: "ወደ ድረ ገጹ",
    eyebrow: "የደንበኛ አስተዳደር",
    title: "የአስተዳዳሪ ዳሽቦርድ",

    description:
      "የደንበኛ መለያዎችን ይፍጠሩ፣ መዳረሻን ይቆጣጠሩና አባልነቶችን ያስተዳድሩ።",

    addCustomer: "ደንበኛ ጨምር",

    total: "ጠቅላላ ደንበኞች",
    active: "ንቁ አባልነቶች",
    expiring: "በቅርቡ የሚያልቁ",
    disabled: "የተዘጉ መለያዎች",

    searchPlaceholder:
      "ስም፣ የተጠቃሚ ስም ወይም ኢሜይል ፈልግ",

    search: "ፈልግ",
    allStatuses: "ሁሉም ሁኔታዎች",

    tableCustomer: "ደንበኛ",
    tableMembership: "አባልነት",
    tableAccess: "መዳረሻ",
    tableLastLogin: "የመጨረሻ መግቢያ",
    tableAction: "እርምጃዎች",

    enabled: "ተፈቅዷል",
    disabledStatus: "ተዘግቷል",
    never: "አልገባም",
    noMembership: "አባልነት የለም",
    remaining: "ቀናት ቀርተዋል",

    emptyTitle:
      "ደንበኛ አልተገኘም",

    emptyDescription:
      "አዲስ ደንበኛ ይጨምሩ ወይም የፍለጋ ማጣሪያውን ይቀይሩ።",

    previous: "ቀዳሚ",
    next: "ቀጣይ",
    page: "ገጽ",

    loadingTitle:
      "ዳሽቦርዱን በማዘጋጀት ላይ",

    loadingDescription:
      "የደንበኛ መረጃና ምስሎች በመጫን ላይ...",

    refreshing:
      "ደንበኞችን በማደስ ላይ...",

    redirecting:
      "በመመለስ ላይ...",

    deleteTitle:
      "ደንበኛው ይሰረዝ?",

    deleteDescription:
      "ይህ መለያውን፣ የአባልነት መረጃውን፣ ንቁ ሴሽኖችንና የመገለጫ ምስሉን ሙሉ በሙሉ ይሰርዛል። መመለስ አይቻልም።",

    deleteCustomer:
      "አዎ",

    keepCustomer:
      "አይ",

    deleting:
      "በመሰረዝ ላይ...",

    closeDialog:
      "ማረጋገጫውን ዝጋ",

    editCustomer:
      "ደንበኛን አስተካክል",

    deleteCustomerAction:
      "ደንበኛን ሰርዝ",

    status: {
      all: "ሁሉም",
      active: "ንቁ",
      expiring: "በቅርቡ የሚያልቅ",
      expired: "ያለቀ",
      scheduled: "የታቀደ",
      paused: "ቆሟል",
      cancelled: "ተሰርዟል",
      inactive: "አባልነት የለም",
      disabled: "ተዘግቷል",
    },

    unknownError:
      "ደንበኞቹን መጫን አልተቻለም። እንደገና ይሞክሩ።",

    unknownDeleteError:
      "ደንበኛውን መሰረዝ አልተቻለም። እንደገና ይሞክሩ።",
  },
} as const;

function RouteRedirect({
  destination,
  label,
}: {
  destination: string;
  label: string;
}) {
  const router = useRouter();

  useEffect(() => {
    router.replace(destination);
  }, [
    destination,
    router,
  ]);

  return (
    <DashboardLoader
      title={label}
      description=""
    />
  );
}

function DashboardLoader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050605] px-6 text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.8) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.8) 1px,transparent 1px)",
          backgroundSize:
            "70px 70px",
        }}
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute h-[420px] w-[420px] rounded-full bg-[#b7ef00]/10 blur-[150px]"
      />

      <div className="relative flex flex-col items-center text-center">
        <div className="relative flex h-24 w-24 items-center justify-center">
          <span className="absolute inset-0 rounded-full border border-[#b7ef00]/15" />

          <span className="absolute inset-2 animate-spin rounded-full border-2 border-transparent border-r-[#b7ef00]/30 border-t-[#b7ef00] motion-reduce:animate-none" />

          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#b7ef00] text-sm font-black tracking-[-0.04em] text-black">
            GH
          </span>
        </div>

        <p className="mt-7 text-[10px] font-black uppercase tracking-[0.28em] text-[#b7ef00]">
          Gym House
        </p>

        <h1 className="mt-3 text-2xl font-black tracking-[-0.04em]">
          {title}
        </h1>

        {description && (
          <p className="mt-3 max-w-sm text-[12px] leading-6 text-white/35">
            {description}
          </p>
        )}

        <div className="mt-7 h-1 w-48 overflow-hidden rounded-full bg-white/[0.06]">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-[#b7ef00]" />
        </div>
      </div>
    </main>
  );
}

function DeleteConfirmationModal({
  customer,
  language,
  isDeleting,
  error,
  onClose,
  onConfirm,
}: {
  customer: AdminCustomer;
  language: DashboardLanguage;
  isDeleting: boolean;
  error: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const text =
    copy[language];

  useEffect(() => {
    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    function handleKeyDown(
      event: KeyboardEvent,
    ) {
      if (
        event.key === "Escape" &&
        !isDeleting
      ) {
        onClose();
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [
    isDeleting,
    onClose,
  ]);

  return (
    <div
      role="presentation"
      onMouseDown={(event) => {
        if (
          event.target ===
            event.currentTarget &&
          !isDeleting
        ) {
          onClose();
        }
      }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 px-4 py-8 backdrop-blur-md"
    >
      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-customer-title"
        aria-describedby="delete-customer-description"
        className="relative w-full max-w-md overflow-hidden rounded-[28px] border border-white/10 bg-[#0b0d0a] p-6 shadow-[0_35px_120px_rgba(0,0,0,.8)] sm:p-7"
      >
        <button
          type="button"
          aria-label={
            text.closeDialog
          }
          disabled={isDeleting}
          onClick={onClose}
          className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.035] text-white/40 transition hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
        >
          <X size={16} />
        </button>

        <div className="flex h-14 w-14 items-center justify-center rounded-[18px] border border-red-400/20 bg-red-400/[0.08] text-red-300">
          <AlertTriangle size={25} />
        </div>

        <h2
          id="delete-customer-title"
          className="mt-6 pr-10 text-2xl font-black tracking-[-0.04em]"
        >
          {text.deleteTitle}
        </h2>

        <div className="mt-4 rounded-[18px] border border-white/[0.07] bg-white/[0.025] p-4">
          <p className="text-[13px] font-bold text-white">
            {customer.name}
          </p>

          <p className="mt-1 text-[10px] text-white/35">
            @{customer.username}
          </p>

          <p className="mt-1 truncate text-[10px] text-white/25">
            {customer.email}
          </p>
        </div>

        <p
          id="delete-customer-description"
          className="mt-5 text-[12px] leading-6 text-white/45"
        >
          {text.deleteDescription}
        </p>

        {error && (
          <p
            role="alert"
            className="mt-4 rounded-[14px] border border-red-400/20 bg-red-400/[0.07] px-4 py-3 text-[11px] leading-5 text-red-200"
          >
            {error}
          </p>
        )}

        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            autoFocus
            disabled={isDeleting}
            onClick={onClose}
            className="h-12 rounded-[15px] border border-white/10 bg-white/[0.035] px-4 text-[9px] font-black uppercase tracking-[0.11em] text-white/60 transition hover:border-white/20 hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            {text.keepCustomer}
          </button>

          <button
            type="button"
            disabled={isDeleting}
            onClick={onConfirm}
            className="flex h-12 items-center justify-center gap-2 rounded-[15px] bg-red-500 px-4 text-[9px] font-black uppercase tracking-[0.1em] text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isDeleting ? (
              <>
                <LoaderCircle
                  size={15}
                  className="animate-spin"
                />

                <span>
                  {text.deleting}
                </span>
              </>
            ) : (
              <>
                <Trash2 size={15} />

                <span>
                  {text.deleteCustomer}
                </span>
              </>
            )}
          </button>
        </div>
      </section>
    </div>
  );
}

function formatDate(
  value: string | null,
  language: DashboardLanguage,
) {
  if (!value) {
    return null;
  }

  const date =
    new Date(
      value.includes("T")
        ? value
        : `${value}T00:00:00`,
    );

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value;
  }

  return new Intl.DateTimeFormat(
    language === "am"
      ? "am-ET"
      : "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  ).format(date);
}

function getStatusClasses(
  status: CustomerStatus,
) {
  switch (status) {
    case "active":
      return "border-[#b7ef00]/20 bg-[#b7ef00]/[0.08] text-[#dfff61]";

    case "expiring":
      return "border-amber-300/20 bg-amber-300/[0.08] text-amber-200";

    case "expired":
    case "cancelled":
    case "disabled":
      return "border-red-400/20 bg-red-400/[0.07] text-red-200";

    case "scheduled":
      return "border-sky-300/20 bg-sky-300/[0.07] text-sky-200";

    case "paused":
      return "border-orange-300/20 bg-orange-300/[0.07] text-orange-200";

    default:
      return "border-white/10 bg-white/[0.04] text-white/45";
  }
}

function CustomerAvatar({
  customer,
}: {
  customer: AdminCustomer;
}) {
  const [
    failedImageUrl,
    setFailedImageUrl,
  ] =
    useState<string | null>(
      null,
    );

  const initial =
    customer.name
      .trim()
      .charAt(0)
      .toUpperCase() || "C";

  const showImage =
    Boolean(
      customer.profileImageUrl,
    ) &&
    failedImageUrl !==
      customer.profileImageUrl;

  return (
    <span className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-[#b7ef00] text-sm font-black text-black">
      {showImage ? (
        <img
          src={
            customer.profileImageUrl ??
            ""
          }
          alt=""
          className="h-full w-full object-cover"
          onError={() => {
            setFailedImageUrl(
              customer.profileImageUrl,
            );
          }}
        />
      ) : (
        initial
      )}
    </span>
  );
}

async function preloadImageUrls(
  urls: Array<
    string | null | undefined
  >,
) {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  const uniqueUrls = [
    ...new Set(
      urls.filter(
        (url): url is string =>
          Boolean(url),
      ),
    ),
  ];

  await Promise.all(
    uniqueUrls.map(
      (url) =>
        new Promise<void>(
          (resolve) => {
            const image =
              new window.Image();

            let completed = false;

            const finish = () => {
              if (completed) {
                return;
              }

              completed = true;

              window.clearTimeout(
                timeout,
              );

              resolve();
            };

            const timeout =
              window.setTimeout(
                finish,
                8000,
              );

            image.onload = finish;
            image.onerror = finish;
            image.src = url;

            if (image.complete) {
              finish();
            }
          },
        ),
    ),
  );
}

function LoadingRows() {
  return (
    <div className="min-h-[350px] animate-pulse p-4 sm:p-5">
      {Array.from({
        length: 5,
      }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-4 border-b border-white/[0.05] py-5 last:border-0"
        >
          <div className="h-11 w-11 shrink-0 rounded-full bg-white/[0.06]" />

          <div className="flex-1">
            <div className="h-3 w-36 rounded-full bg-white/[0.07]" />

            <div className="mt-2 h-2 w-24 rounded-full bg-white/[0.04]" />
          </div>

          <div className="hidden h-8 w-24 rounded-full bg-white/[0.05] sm:block" />

          <div className="h-10 w-20 rounded-[13px] bg-white/[0.05]" />
        </div>
      ))}
    </div>
  );
}

export default function AdminDashboardPage() {
  const {
    user,
    isLoading:
      isAuthLoading,
  } = useAuth();

  const { language } =
    useLanguage();

  const currentLanguage:
    DashboardLanguage =
    language === "am"
      ? "am"
      : "en";

  const text =
    copy[currentLanguage];

  const [
    customers,
    setCustomers,
  ] =
    useState<AdminCustomer[]>(
      [],
    );

  const [
    summary,
    setSummary,
  ] =
    useState<CustomerSummary>(
      emptySummary,
    );

  const [
    pagination,
    setPagination,
  ] =
    useState<CustomerPagination>(
      emptyPagination,
    );

  const [
    searchInput,
    setSearchInput,
  ] =
    useState("");

  const [
    appliedSearch,
    setAppliedSearch,
  ] =
    useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] =
    useState<CustomerStatusFilter>(
      "all",
    );

  const [
    isInitialLoading,
    setIsInitialLoading,
  ] =
    useState(true);

  const [
    isCustomersLoading,
    setIsCustomersLoading,
  ] =
    useState(false);

  const [
    pageMessage,
    setPageMessage,
  ] =
    useState("");

  const [
    pageError,
    setPageError,
  ] =
    useState("");

  const [
    modal,
    setModal,
  ] =
    useState<ModalState>(
      null,
    );

  const [
    deleteTarget,
    setDeleteTarget,
  ] =
    useState<AdminCustomer | null>(
      null,
    );

  const [
    isDeleting,
    setIsDeleting,
  ] =
    useState(false);

  const [
    deleteError,
    setDeleteError,
  ] =
    useState("");

  useEffect(() => {
    if (
      isAuthLoading ||
      !user ||
      user.role !== "admin"
    ) {
      return;
    }

    let cancelled = false;

    async function loadInitialData() {
      try {
        const result =
          await getAdminCustomers({
            page: 1,
            limit: 12,
            search: "",
            status: "all",
          });

        await preloadImageUrls([
          user.profileImageUrl,
          ...result.customers.map(
            (customer) =>
              customer.profileImageUrl,
          ),
        ]);

        if (cancelled) {
          return;
        }

        setCustomers(
          result.customers,
        );

        setSummary(
          result.summary,
        );

        setPagination(
          result.pagination,
        );
      } catch (error: unknown) {
        if (cancelled) {
          return;
        }

        if (
          error instanceof
          AuthApiError
        ) {
          setPageError(
            error.getMessage(
              currentLanguage,
            ),
          );
        } else {
          setPageError(
            text.unknownError,
          );
        }
      } finally {
        if (!cancelled) {
          setIsInitialLoading(
            false,
          );
        }
      }
    }

    void loadInitialData();

    return () => {
      cancelled = true;
    };
  }, [
    currentLanguage,
    isAuthLoading,
    text.unknownError,
    user,
  ]);

  async function loadCustomers({
    page = 1,
    search = appliedSearch,
    status = statusFilter,
  }: {
    page?: number;
    search?: string;
    status?: CustomerStatusFilter;
  } = {}) {
    setIsCustomersLoading(true);
    setPageError("");

    try {
      const result =
        await getAdminCustomers({
          page,
          limit: 12,
          search,
          status,
        });

      await preloadImageUrls(
        result.customers.map(
          (customer) =>
            customer.profileImageUrl,
        ),
      );

      setCustomers(
        result.customers,
      );

      setSummary(
        result.summary,
      );

      setPagination(
        result.pagination,
      );
    } catch (error: unknown) {
      if (
        error instanceof
        AuthApiError
      ) {
        setPageError(
          error.getMessage(
            currentLanguage,
          ),
        );
      } else {
        setPageError(
          text.unknownError,
        );
      }
    } finally {
      setIsCustomersLoading(
        false,
      );
    }
  }

  function handleSearch(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const nextSearch =
      searchInput.trim();

    setAppliedSearch(
      nextSearch,
    );

    void loadCustomers({
      page: 1,
      search: nextSearch,
      status: statusFilter,
    });
  }

  async function handleSaved(
    message: string,
  ) {
    setModal(null);
    setPageMessage(message);

    await loadCustomers({
      page: pagination.page,
    });
  }

  async function handleDelete() {
    if (!deleteTarget) {
      return;
    }

    setIsDeleting(true);
    setDeleteError("");
    setPageError("");
    setPageMessage("");

    try {
      const result =
        await deleteAdminCustomer(
          deleteTarget.id,
        );

      const nextPage =
        customers.length === 1 &&
        pagination.page > 1
          ? pagination.page - 1
          : pagination.page;

      setDeleteTarget(null);

      setPageMessage(
        result.message[
          currentLanguage
        ],
      );

      await loadCustomers({
        page: nextPage,
      });
    } catch (error: unknown) {
      if (
        error instanceof
        AuthApiError
      ) {
        setDeleteError(
          error.getMessage(
            currentLanguage,
          ),
        );
      } else {
        setDeleteError(
          text.unknownDeleteError,
        );
      }
    } finally {
      setIsDeleting(false);
    }
  }

  if (isAuthLoading) {
    return (
      <DashboardLoader
        title={text.loadingTitle}
        description={
          text.loadingDescription
        }
      />
    );
  }

  if (!user) {
    return (
      <RouteRedirect
        destination="/login"
        label={text.redirecting}
      />
    );
  }

  if (
    user.role !== "admin"
  ) {
    return (
      <RouteRedirect
        destination="/account"
        label={text.redirecting}
      />
    );
  }

  if (isInitialLoading) {
    return (
      <DashboardLoader
        title={text.loadingTitle}
        description={
          text.loadingDescription
        }
      />
    );
  }

  const statusOptions:
    CustomerStatusFilter[] = [
      "all",
      "active",
      "expiring",
      "expired",
      "scheduled",
      "paused",
      "cancelled",
      "inactive",
      "disabled",
    ];

  const statisticCards = [
    {
      label: text.total,
      value:
        summary.totalCustomers,
      icon: Users,
    },
    {
      label: text.active,
      value:
        summary.activeMemberships,
      icon: UserCheck,
    },
    {
      label: text.expiring,
      value:
        summary.expiringMemberships,
      icon: Clock3,
    },
    {
      label: text.disabled,
      value:
        summary.disabledAccounts,
      icon: UserX,
    },
  ];

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050605] px-4 pb-16 pt-5 text-white sm:px-7 sm:pt-7 lg:px-10 lg:pb-20">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.8) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.8) 1px,transparent 1px)",
          backgroundSize:
            "72px 72px",
        }}
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 top-24 h-[480px] w-[480px] rounded-full bg-[#b7ef00]/10 blur-[170px]"
      />

      <div className="relative mx-auto max-w-[1500px]">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-white/45 transition hover:text-[#b7ef00]"
          >
            <ArrowLeft size={15} />

            <span>
              {text.back}
            </span>
          </Link>

          <div className="flex min-w-0 items-center gap-3 rounded-full border border-white/[0.07] bg-white/[0.025] py-1.5 pl-1.5 pr-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#b7ef00] text-xs font-black text-black">
              {user.profileImageUrl ? (
                <img
                  src={
                    user.profileImageUrl
                  }
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                user.name
                  .charAt(0)
                  .toUpperCase()
              )}
            </span>

            <span className="min-w-0">
              <span className="block max-w-[180px] truncate text-[11px] font-bold">
                {user.name}
              </span>

              <span className="mt-0.5 block max-w-[180px] truncate text-[8px] text-white/30">
                {user.email}
              </span>
            </span>
          </div>
        </header>

        <section className="mt-14 flex flex-col gap-7 lg:mt-20 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#b7ef00]">
              {text.eyebrow}
            </p>

            <h1 className="mt-4 max-w-4xl text-[clamp(3rem,8vw,6.8rem)] font-black leading-[0.86] tracking-[-0.07em]">
              {text.title}
            </h1>

            <p className="mt-6 max-w-2xl text-[13px] leading-7 text-white/38 sm:text-[15px]">
              {text.description}
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setModal({
                type: "create",
                customer: null,
              });

              setPageMessage("");
            }}
            className="flex h-14 w-full items-center justify-center gap-3 rounded-[18px] bg-[#b7ef00] px-7 text-[10px] font-black uppercase tracking-[0.17em] text-black transition hover:-translate-y-0.5 hover:bg-[#ccff32] sm:w-fit"
          >
            <Plus size={18} />

            <span>
              {text.addCustomer}
            </span>
          </button>
        </section>

        <section className="mt-10 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {statisticCards.map(
            (card) => {
              const Icon =
                card.icon;

              return (
                <article
                  key={card.label}
                  className="group rounded-[22px] border border-white/[0.075] bg-white/[0.025] p-5 backdrop-blur-sm transition hover:border-[#b7ef00]/20 hover:bg-white/[0.035] sm:p-6"
                >
                  <div className="flex items-start justify-between gap-4">
                    <p className="text-3xl font-black tracking-[-0.05em] sm:text-4xl">
                      {card.value}
                    </p>

                    <span className="flex h-9 w-9 items-center justify-center rounded-[12px] border border-white/[0.07] bg-white/[0.035] text-white/25 transition group-hover:border-[#b7ef00]/20 group-hover:text-[#b7ef00]">
                      <Icon size={17} />
                    </span>
                  </div>

                  <p className="mt-3 text-[8px] font-black uppercase tracking-[0.16em] text-white/30 sm:text-[9px]">
                    {card.label}
                  </p>
                </article>
              );
            },
          )}
        </section>

        <section className="mt-6 overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#090b08]/90 shadow-[0_30px_90px_rgba(0,0,0,.35)] backdrop-blur-xl">
          <div className="flex flex-col gap-3 border-b border-white/[0.07] p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
            <form
              onSubmit={handleSearch}
              className="flex w-full gap-2 lg:max-w-xl"
            >
              <div className="relative min-w-0 flex-1">
                <Search
                  size={16}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/20"
                />

                <input
                  type="search"
                  value={searchInput}
                  placeholder={
                    text.searchPlaceholder
                  }
                  onChange={(event) => {
                    setSearchInput(
                      event.target.value,
                    );
                  }}
                  className="h-12 w-full rounded-[15px] border border-white/[0.09] bg-white/[0.035] pl-11 pr-4 text-[12px] text-white outline-none transition placeholder:text-white/20 focus:border-[#b7ef00]/45 focus:bg-white/[0.05]"
                />
              </div>

              <button
                type="submit"
                aria-label={
                  text.search
                }
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[15px] bg-white text-black transition hover:bg-[#b7ef00]"
              >
                <Search size={17} />
              </button>
            </form>

            <select
              aria-label={
                text.allStatuses
              }
              value={statusFilter}
              onChange={(event) => {
                const nextStatus =
                  event.target
                    .value as CustomerStatusFilter;

                setStatusFilter(
                  nextStatus,
                );

                void loadCustomers({
                  page: 1,
                  search:
                    appliedSearch,
                  status:
                    nextStatus,
                });
              }}
              className="h-12 rounded-[15px] border border-white/[0.09] bg-white/[0.035] px-4 text-[11px] font-bold text-white/65 outline-none lg:min-w-[190px]"
            >
              {statusOptions.map(
                (status) => (
                  <option
                    key={status}
                    value={status}
                    className="bg-[#11130f]"
                  >
                    {
                      text.status[
                        status
                      ]
                    }
                  </option>
                ),
              )}
            </select>
          </div>

          {pageMessage && (
            <p
              role="status"
              className="mx-4 mt-4 flex items-center gap-2 rounded-[14px] border border-[#b7ef00]/20 bg-[#b7ef00]/[0.055] px-4 py-3 text-[11px] text-[#dfff61] sm:mx-5"
            >
              <ShieldCheck size={15} />

              <span>
                {pageMessage}
              </span>
            </p>
          )}

          {pageError && (
            <p
              role="alert"
              className="mx-4 mt-4 rounded-[14px] border border-red-400/25 bg-red-400/[0.07] px-4 py-3 text-[11px] text-red-200 sm:mx-5"
            >
              {pageError}
            </p>
          )}

          {isCustomersLoading ? (
            <LoadingRows />
          ) : customers.length === 0 ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center px-6 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full border border-[#b7ef00]/20 bg-[#b7ef00]/[0.06] text-[#b7ef00]">
                <Users size={27} />
              </span>

              <h2 className="mt-5 text-2xl font-black tracking-[-0.04em]">
                {text.emptyTitle}
              </h2>

              <p className="mt-3 max-w-md text-[12px] leading-6 text-white/35">
                {text.emptyDescription}
              </p>
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[1050px] border-collapse">
                  <thead>
                    <tr className="border-b border-white/[0.07] text-left">
                      <th className="px-5 py-4 text-[8px] font-black uppercase tracking-[0.17em] text-white/25">
                        {text.tableCustomer}
                      </th>

                      <th className="px-5 py-4 text-[8px] font-black uppercase tracking-[0.17em] text-white/25">
                        {text.tableMembership}
                      </th>

                      <th className="px-5 py-4 text-[8px] font-black uppercase tracking-[0.17em] text-white/25">
                        {text.tableAccess}
                      </th>

                      <th className="px-5 py-4 text-[8px] font-black uppercase tracking-[0.17em] text-white/25">
                        {text.tableLastLogin}
                      </th>

                      <th className="px-5 py-4 text-right text-[8px] font-black uppercase tracking-[0.17em] text-white/25">
                        {text.tableAction}
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {customers.map(
                      (customer) => (
                        <tr
                          key={customer.id}
                          className="border-b border-white/[0.055] transition last:border-b-0 hover:bg-white/[0.018]"
                        >
                          <td className="px-5 py-4">
                            <div className="flex min-w-0 items-center gap-3">
                              <CustomerAvatar
                                customer={
                                  customer
                                }
                              />

                              <div className="min-w-0">
                                <p className="max-w-[220px] truncate text-[12px] font-bold">
                                  {customer.name}
                                </p>

                                <p className="mt-1 max-w-[220px] truncate text-[10px] text-white/30">
                                  @{customer.username}
                                </p>

                                <p className="mt-0.5 max-w-[220px] truncate text-[9px] text-white/20">
                                  {customer.email}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex rounded-full border px-3 py-1.5 text-[8px] font-black uppercase tracking-[0.12em] ${getStatusClasses(
                                customer.status,
                              )}`}
                            >
                              {
                                text.status[
                                  customer
                                    .status
                                ]
                              }
                            </span>

                            {customer.membership ? (
                              <p className="mt-2 text-[9px] text-white/30">
                                {formatDate(
                                  customer
                                    .membership
                                    .expiresAt,
                                  currentLanguage,
                                )}

                                {customer
                                  .membership
                                  .remainingDays >
                                  0 &&
                                  ` · ${customer.membership.remainingDays} ${text.remaining}`}
                              </p>
                            ) : (
                              <p className="mt-2 text-[9px] text-white/25">
                                {text.noMembership}
                              </p>
                            )}
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex items-center gap-2 text-[10px] font-bold ${
                                customer.isActive
                                  ? "text-[#dfff61]"
                                  : "text-red-300"
                              }`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  customer.isActive
                                    ? "bg-[#b7ef00]"
                                    : "bg-red-400"
                                }`}
                              />

                              {customer.isActive
                                ? text.enabled
                                : text.disabledStatus}
                            </span>
                          </td>

                          <td className="px-5 py-4 text-[10px] text-white/35">
                            {formatDate(
                              customer.lastLoginAt,
                              currentLanguage,
                            ) ??
                              text.never}
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                aria-label={
                                  text.editCustomer
                                }
                                onClick={() => {
                                  setModal({
                                    type: "edit",
                                    customer,
                                  });

                                  setPageMessage(
                                    "",
                                  );
                                }}
                                className="flex h-10 w-10 items-center justify-center rounded-[13px] border border-white/10 bg-white/[0.035] text-white/45 transition hover:border-[#b7ef00]/35 hover:bg-[#b7ef00]/[0.07] hover:text-[#b7ef00]"
                              >
                                <Pencil size={15} />
                              </button>

                              <button
                                type="button"
                                aria-label={
                                  text.deleteCustomerAction
                                }
                                onClick={() => {
                                  setDeleteError(
                                    "",
                                  );

                                  setDeleteTarget(
                                    customer,
                                  );
                                }}
                                className="flex h-10 w-10 items-center justify-center rounded-[13px] border border-red-400/15 bg-red-400/[0.04] text-red-300/55 transition hover:border-red-400/35 hover:bg-red-400/[0.09] hover:text-red-200"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>

              <div className="grid gap-3 p-4 sm:grid-cols-2 lg:hidden">
                {customers.map(
                  (customer) => (
                    <article
                      key={customer.id}
                      className="rounded-[22px] border border-white/[0.075] bg-white/[0.023] p-4"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <CustomerAvatar
                          customer={
                            customer
                          }
                        />

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13px] font-bold">
                            {customer.name}
                          </p>

                          <p className="mt-1 truncate text-[10px] text-white/30">
                            @{customer.username}
                          </p>
                        </div>

                        <span
                          className={`shrink-0 rounded-full border px-2.5 py-1 text-[7px] font-black uppercase ${getStatusClasses(
                            customer.status,
                          )}`}
                        >
                          {
                            text.status[
                              customer
                                .status
                            ]
                          }
                        </span>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <div className="rounded-[14px] bg-white/[0.025] p-3">
                          <p className="text-[8px] font-black uppercase tracking-[0.13em] text-white/20">
                            {text.tableMembership}
                          </p>

                          <p className="mt-2 text-[10px] text-white/55">
                            {customer.membership
                              ? formatDate(
                                  customer
                                    .membership
                                    .expiresAt,
                                  currentLanguage,
                                )
                              : text.noMembership}
                          </p>
                        </div>

                        <div className="rounded-[14px] bg-white/[0.025] p-3">
                          <p className="text-[8px] font-black uppercase tracking-[0.13em] text-white/20">
                            {text.tableAccess}
                          </p>

                          <p
                            className={`mt-2 text-[10px] font-bold ${
                              customer.isActive
                                ? "text-[#dfff61]"
                                : "text-red-300"
                            }`}
                          >
                            {customer.isActive
                              ? text.enabled
                              : text.disabledStatus}
                          </p>
                        </div>
                      </div>

                      <p className="mt-3 truncate text-[9px] text-white/25">
                        {customer.email}
                      </p>

                      <div className="mt-4 flex items-center justify-end gap-2">
                        <button
                          type="button"
                          aria-label={
                            text.editCustomer
                          }
                          onClick={() => {
                            setModal({
                              type: "edit",
                              customer,
                            });

                            setPageMessage(
                              "",
                            );
                          }}
                          className="flex h-11 w-11 items-center justify-center rounded-[14px] border border-white/10 bg-white/[0.035] text-white/55 transition hover:border-[#b7ef00]/30 hover:bg-[#b7ef00]/[0.07] hover:text-[#b7ef00]"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          type="button"
                          aria-label={
                            text.deleteCustomerAction
                          }
                          onClick={() => {
                            setDeleteError(
                              "",
                            );

                            setDeleteTarget(
                              customer,
                            );
                          }}
                          className="flex h-11 w-11 items-center justify-center rounded-[14px] border border-red-400/15 bg-red-400/[0.04] text-red-300/70 transition hover:border-red-400/35 hover:bg-red-400/[0.09] hover:text-red-200"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </article>
                  ),
                )}
              </div>
            </>
          )}

          {!isCustomersLoading &&
            pagination.totalPages >
              1 && (
              <footer className="flex items-center justify-between gap-4 border-t border-white/[0.07] px-4 py-4 sm:px-5">
                <button
                  type="button"
                  aria-label={
                    text.previous
                  }
                  disabled={
                    pagination.page <=
                    1
                  }
                  onClick={() => {
                    void loadCustomers({
                      page:
                        pagination.page -
                        1,
                    });
                  }}
                  className="flex h-10 items-center gap-2 rounded-[13px] border border-white/10 px-3 text-[9px] font-black uppercase tracking-[0.11em] text-white/40 transition hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-25"
                >
                  <ChevronLeft
                    size={14}
                  />

                  <span className="hidden sm:inline">
                    {text.previous}
                  </span>
                </button>

                <p className="text-[10px] text-white/30">
                  {text.page}{" "}
                  {pagination.page} /{" "}
                  {
                    pagination.totalPages
                  }
                </p>

                <button
                  type="button"
                  aria-label={text.next}
                  disabled={
                    pagination.page >=
                    pagination.totalPages
                  }
                  onClick={() => {
                    void loadCustomers({
                      page:
                        pagination.page +
                        1,
                    });
                  }}
                  className="flex h-10 items-center gap-2 rounded-[13px] border border-white/10 px-3 text-[9px] font-black uppercase tracking-[0.11em] text-white/40 transition hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-25"
                >
                  <span className="hidden sm:inline">
                    {text.next}
                  </span>

                  <ChevronRight
                    size={14}
                  />
                </button>
              </footer>
            )}
        </section>
      </div>

      {modal && (
        <CustomerFormModal
          key={
            modal.type === "create"
              ? "create-customer"
              : modal.customer.id
          }
          language={
            currentLanguage
          }
          customer={
            modal.customer
          }
          onClose={() => {
            setModal(null);
          }}
          onSaved={handleSaved}
        />
      )}

      {deleteTarget && (
        <DeleteConfirmationModal
          customer={deleteTarget}
          language={
            currentLanguage
          }
          isDeleting={isDeleting}
          error={deleteError}
          onClose={() => {
            if (!isDeleting) {
              setDeleteTarget(
                null,
              );

              setDeleteError("");
            }
          }}
          onConfirm={() => {
            void handleDelete();
          }}
        />
      )}
    </main>
  );
}