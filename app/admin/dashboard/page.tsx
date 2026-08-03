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

import CustomerFormModal from "@/components/admin/customer-form-modal";
import { useAuth } from "@/components/providers/auth-provider";
import { useLanguage } from "@/components/providers/language-provider";
import {
  AuthApiError,
} from "@/lib/auth-api";
import {
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
    tableAction: "Action",

    edit: "Manage",
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

    loading: "Loading customers...",
    redirecting: "Redirecting...",

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
    tableAction: "እርምጃ",

    edit: "አስተዳድር",
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

    loading: "ደንበኞችን በመጫን ላይ...",
    redirecting: "በመመለስ ላይ...",

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
    <main className="flex min-h-screen items-center justify-center bg-[#050605] text-white">
      <p className="text-sm text-white/40">
        {label}
      </p>
    </main>
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
  const initial =
    customer.name
      .trim()
      .charAt(0)
      .toUpperCase() || "C";

  return (
    <span
      aria-hidden="true"
      className="
        flex
        h-11
        w-11
        shrink-0
        items-center
        justify-center
        overflow-hidden
        rounded-full
        border
        border-white/10
        bg-[#b7ef00]
        bg-cover
        bg-center
        text-sm
        font-black
        text-black
      "
      style={
        customer.profileImageUrl
          ? {
              backgroundImage:
                `url("${customer.profileImageUrl}")`,
            }
          : undefined
      }
    >
      {!customer.profileImageUrl &&
        initial}
    </span>
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

  const [customers, setCustomers] =
    useState<AdminCustomer[]>(
      [],
    );

  const [summary, setSummary] =
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
  ] = useState("");

  const [
    appliedSearch,
    setAppliedSearch,
  ] = useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] =
    useState<CustomerStatusFilter>(
      "all",
    );

  const [
    isCustomersLoading,
    setIsCustomersLoading,
  ] = useState(true);

  const [
    pageMessage,
    setPageMessage,
  ] = useState("");

  const [
    pageError,
    setPageError,
  ] = useState("");

  const [
    modal,
    setModal,
  ] = useState<ModalState>(
    null,
  );

  useEffect(() => {
    let cancelled = false;

    getAdminCustomers({
      page: 1,
      limit: 12,
      search: "",
      status: "all",
    })
      .then((result) => {
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
      })
      .catch(
        (error: unknown) => {
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

            return;
          }

          setPageError(
            text.unknownError,
          );
        },
      )
      .finally(() => {
        if (!cancelled) {
          setIsCustomersLoading(
            false,
          );
        }
      });

    return () => {
      cancelled = true;
    };
    }, [
    currentLanguage,
    text.unknownError,
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
      setIsCustomersLoading(false);
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
      page:
        pagination.page,
    });
  }

  if (isAuthLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050605] text-white">
        <p className="animate-pulse text-sm text-white/40">
          {text.loading}
        </p>
      </main>
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
    },
    {
      label: text.active,
      value:
        summary.activeMemberships,
    },
    {
      label: text.expiring,
      value:
        summary.expiringMemberships,
    },
    {
      label: text.disabled,
      value:
        summary.disabledAccounts,
    },
  ];

  return (
    <main
      className="
        relative
        min-h-screen
        overflow-hidden
        bg-[#050605]
        px-4
        pb-16
        pt-5
        text-white

        sm:px-7
        sm:pt-7

        lg:px-10
        lg:pb-20
      "
    >
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
        className="
          pointer-events-none
          absolute
          -left-40
          top-24
          h-[480px]
          w-[480px]
          rounded-full
          bg-[#b7ef00]/10
          blur-[170px]
        "
      />

      <div className="relative mx-auto max-w-[1500px]">
        <header
          className="
            flex
            flex-wrap
            items-center
            justify-between
            gap-4
          "
        >
          <Link
            href="/"
            className="
              inline-flex
              items-center
              gap-3
              text-[10px]
              font-black
              uppercase
              tracking-[0.16em]
              text-white/45
              transition

              hover:text-[#b7ef00]
            "
          >
            <span>←</span>
            <span>{text.back}</span>
          </Link>

          <div className="flex min-w-0 items-center gap-3">
            <span
              aria-hidden="true"
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                overflow-hidden
                rounded-full
                border
                border-white/10
                bg-[#b7ef00]
                bg-cover
                bg-center
                text-xs
                font-black
                text-black
              "
              style={
                user.profileImageUrl
                  ? {
                      backgroundImage:
                        `url("${user.profileImageUrl}")`,
                    }
                  : undefined
              }
            >
              {!user.profileImageUrl &&
                user.name
                  .charAt(0)
                  .toUpperCase()}
            </span>

            <span className="min-w-0">
              <span className="block max-w-[180px] truncate text-[12px] font-bold">
                {user.name}
              </span>

              <span className="mt-0.5 block max-w-[180px] truncate text-[9px] text-white/30">
                {user.email}
              </span>
            </span>
          </div>
        </header>

        <section
          className="
            mt-14
            flex
            flex-col
            gap-7

            lg:mt-20
            lg:flex-row
            lg:items-end
            lg:justify-between
          "
        >
          <div>
            <p
              className="
                text-[9px]
                font-black
                uppercase
                tracking-[0.3em]
                text-[#b7ef00]
              "
            >
              {text.eyebrow}
            </p>

            <h1
              className="
                mt-4
                max-w-4xl
                text-[clamp(3rem,8vw,6.8rem)]
                font-black
                leading-[0.86]
                tracking-[-0.07em]
              "
            >
              {text.title}
            </h1>

            <p
              className="
                mt-6
                max-w-2xl
                text-[13px]
                leading-7
                text-white/38

                sm:text-[15px]
              "
            >
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
            className="
              flex
              h-14
              w-full
              items-center
              justify-center
              gap-3
              rounded-[18px]
              bg-[#b7ef00]
              px-7
              text-[10px]
              font-black
              uppercase
              tracking-[0.17em]
              text-black
              transition

              hover:-translate-y-0.5
              hover:bg-[#ccff32]

              sm:w-fit
            "
          >
            <span className="text-lg leading-none">
              +
            </span>

            <span>
              {text.addCustomer}
            </span>
          </button>
        </section>

        <section
          className="
            mt-10
            grid
            grid-cols-2
            gap-3

            lg:grid-cols-4
          "
        >
          {statisticCards.map(
            (card) => (
              <article
                key={card.label}
                className="
                  rounded-[22px]
                  border
                  border-white/[0.075]
                  bg-white/[0.025]
                  p-5
                  backdrop-blur-sm

                  sm:p-6
                "
              >
                <p
                  className="
                    text-3xl
                    font-black
                    tracking-[-0.05em]

                    sm:text-4xl
                  "
                >
                  {card.value}
                </p>

                <p
                  className="
                    mt-2
                    text-[8px]
                    font-black
                    uppercase
                    tracking-[0.16em]
                    text-white/30

                    sm:text-[9px]
                  "
                >
                  {card.label}
                </p>
              </article>
            ),
          )}
        </section>

        <section
          className="
            mt-6
            overflow-hidden
            rounded-[28px]
            border
            border-white/[0.08]
            bg-[#090b08]/90
            shadow-[0_30px_90px_rgba(0,0,0,.35)]
            backdrop-blur-xl
          "
        >
          <div
            className="
              flex
              flex-col
              gap-3
              border-b
              border-white/[0.07]
              p-4

              sm:p-5

              lg:flex-row
              lg:items-center
              lg:justify-between
            "
          >
            <form
              onSubmit={handleSearch}
              className="
                flex
                w-full
                gap-2

                lg:max-w-xl
              "
            >
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
                className="
                  h-12
                  min-w-0
                  flex-1
                  rounded-[15px]
                  border
                  border-white/[0.09]
                  bg-white/[0.035]
                  px-4
                  text-[12px]
                  text-white
                  outline-none
                  transition
                  placeholder:text-white/20

                  focus:border-[#b7ef00]/45
                  focus:bg-white/[0.05]
                "
              />

              <button
                type="submit"
                className="
                  h-12
                  rounded-[15px]
                  bg-white
                  px-5
                  text-[9px]
                  font-black
                  uppercase
                  tracking-[0.13em]
                  text-black
                  transition

                  hover:bg-[#b7ef00]
                "
              >
                {text.search}
              </button>
            </form>

            <select
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
              className="
                h-12
                rounded-[15px]
                border
                border-white/[0.09]
                bg-white/[0.035]
                px-4
                text-[11px]
                font-bold
                text-white/65
                outline-none

                lg:min-w-[190px]
              "
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
              className="
                mx-4
                mt-4
                rounded-[14px]
                border
                border-[#b7ef00]/20
                bg-[#b7ef00]/[0.055]
                px-4
                py-3
                text-[11px]
                text-[#dfff61]

                sm:mx-5
              "
            >
              {pageMessage}
            </p>
          )}

          {pageError && (
            <p
              role="alert"
              className="
                mx-4
                mt-4
                rounded-[14px]
                border
                border-red-400/25
                bg-red-400/[0.07]
                px-4
                py-3
                text-[11px]
                text-red-200

                sm:mx-5
              "
            >
              {pageError}
            </p>
          )}

          {isCustomersLoading ? (
            <div className="flex min-h-[360px] items-center justify-center">
              <p className="animate-pulse text-[12px] text-white/35">
                {text.loading}
              </p>
            </div>
          ) : customers.length === 0 ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center px-6 text-center">
              <span
                className="
                  flex
                  h-16
                  w-16
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-[#b7ef00]/20
                  bg-[#b7ef00]/[0.06]
                  text-3xl
                  text-[#b7ef00]
                "
              >
                +
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
                      {[
                        text.tableCustomer,
                        text.tableMembership,
                        text.tableAccess,
                        text.tableLastLogin,
                        text.tableAction,
                      ].map(
                        (heading) => (
                          <th
                            key={heading}
                            className="
                              px-5
                              py-4
                              text-[8px]
                              font-black
                              uppercase
                              tracking-[0.17em]
                              text-white/25
                            "
                          >
                            {heading}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>

                  <tbody>
                    {customers.map(
                      (customer) => (
                        <tr
                          key={customer.id}
                          className="
                            border-b
                            border-white/[0.055]
                            transition

                            last:border-b-0

                            hover:bg-white/[0.018]
                          "
                        >
                          <td className="px-5 py-4">
                            <div className="flex min-w-0 items-center gap-3">
                              <CustomerAvatar
                                customer={customer}
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
                              className={`
                                inline-flex
                                rounded-full
                                border
                                px-3
                                py-1.5
                                text-[8px]
                                font-black
                                uppercase
                                tracking-[0.12em]

                                ${getStatusClasses(
                                  customer.status,
                                )}
                              `}
                            >
                              {
                                text.status[
                                  customer.status
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
                              className={`
                                inline-flex
                                items-center
                                gap-2
                                text-[10px]
                                font-bold

                                ${
                                  customer.isActive
                                    ? "text-[#dfff61]"
                                    : "text-red-300"
                                }
                              `}
                            >
                              <span
                                className={`
                                  h-1.5
                                  w-1.5
                                  rounded-full

                                  ${
                                    customer.isActive
                                      ? "bg-[#b7ef00]"
                                      : "bg-red-400"
                                  }
                                `}
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
                            <button
                              type="button"
                              onClick={() => {
                                setModal({
                                  type: "edit",
                                  customer,
                                });

                                setPageMessage("");
                              }}
                              className="
                                h-10
                                rounded-[13px]
                                border
                                border-white/10
                                bg-white/[0.035]
                                px-4
                                text-[9px]
                                font-black
                                uppercase
                                tracking-[0.12em]
                                text-white/45
                                transition

                                hover:border-[#b7ef00]/30
                                hover:text-[#b7ef00]
                              "
                            >
                              {text.edit}
                            </button>
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
                      className="
                        rounded-[22px]
                        border
                        border-white/[0.075]
                        bg-white/[0.023]
                        p-4
                      "
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <CustomerAvatar
                          customer={customer}
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
                          className={`
                            shrink-0
                            rounded-full
                            border
                            px-2.5
                            py-1
                            text-[7px]
                            font-black
                            uppercase

                            ${getStatusClasses(
                              customer.status,
                            )}
                          `}
                        >
                          {
                            text.status[
                              customer.status
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
                            className={`
                              mt-2
                              text-[10px]
                              font-bold

                              ${
                                customer.isActive
                                  ? "text-[#dfff61]"
                                  : "text-red-300"
                              }
                            `}
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

                      <button
                        type="button"
                        onClick={() => {
                          setModal({
                            type: "edit",
                            customer,
                          });

                          setPageMessage("");
                        }}
                        className="
                          mt-4
                          h-11
                          w-full
                          rounded-[14px]
                          border
                          border-white/10
                          bg-white/[0.035]
                          text-[9px]
                          font-black
                          uppercase
                          tracking-[0.13em]
                          text-white/50
                          transition

                          hover:border-[#b7ef00]/30
                          hover:text-[#b7ef00]
                        "
                      >
                        {text.edit}
                      </button>
                    </article>
                  ),
                )}
              </div>
            </>
          )}

          {!isCustomersLoading &&
            pagination.totalPages >
              1 && (
              <footer
                className="
                  flex
                  items-center
                  justify-between
                  gap-4
                  border-t
                  border-white/[0.07]
                  px-4
                  py-4

                  sm:px-5
                "
              >
                <button
                  type="button"
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
                  className="
                    h-10
                    rounded-[13px]
                    border
                    border-white/10
                    px-4
                    text-[9px]
                    font-black
                    uppercase
                    tracking-[0.11em]
                    text-white/40

                    disabled:cursor-not-allowed
                    disabled:opacity-25
                  "
                >
                  {text.previous}
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
                  className="
                    h-10
                    rounded-[13px]
                    border
                    border-white/10
                    px-4
                    text-[9px]
                    font-black
                    uppercase
                    tracking-[0.11em]
                    text-white/40

                    disabled:cursor-not-allowed
                    disabled:opacity-25
                  "
                >
                  {text.next}
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
          onSaved={
            handleSaved
          }
        />
      )}
    </main>
  );
}