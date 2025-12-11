"use client";

import { MainNav } from "../../sca-dashboard/components/layout/main-nav";
import { AppSidebarNav } from "../../sca-dashboard/components/layout/sidebar/app-sidebar-nav";
import { HelpButton } from "../../sca-dashboard/components/layout/sidebar/help-button";
import { SettingsButton } from "../../sca-dashboard/components/layout/sidebar/settings-button";
import { PageContent } from "../../sca-dashboard/components/layout/page-content";
import { PageWidthWrapper } from "../../sca-dashboard/components/layout/page-width-wrapper";
import { Input } from "../../sca-dashboard/components/ui/input";
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  Search,
  Eye,
  Mail,
  Phone,
  MessageSquare,
  FileText,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Link from "next/link";
import { useState, useMemo, Suspense } from "react";
import * as Collapsible from "@radix-ui/react-collapsible";

interface HelpSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: string[];
  subsections?: { title: string; content: string[] }[];
}

const helpSections: HelpSection[] = [
  {
    id: "overview",
    title: "Overview Dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
    content: [
      "Access the Overview by clicking the Dashboard icon in the left sidebar, or navigate to /admin",
      "View key metrics: Total Revenue, Total Orders, and Average Order Value with mini charts",
      "See recent orders table with pagination controls",
      "Browse top products with order counts",
    ],
    subsections: [
      {
        title: "Quick Actions",
        content: [
          "Click any order number to view details",
          "Use pagination buttons to navigate through order pages",
          "Refresh data using the refresh button in the top right",
        ],
      },
    ],
  },
  {
    id: "orders",
    title: "Orders Management",
    icon: <ShoppingCart className="h-5 w-5" />,
    content: [
      "Click the Orders icon in the left sidebar under Marketplace, or navigate to /admin/orders",
      "Search orders by order number, customer name, or email using the search bar",
      "Filter orders by status (Pending, Processing, Delivered, etc.)",
    ],
    subsections: [
      {
        title: "Viewing Order Details",
        content: [
          "Click on any order row in the table, or click the eye icon in Actions column",
          "The modal shows: customer info, order items, total, quick actions, status update, and notes",
        ],
      },
      {
        title: "Updating Order Status",
        content: [
          "Open the order detail modal",
          "In the right sidebar, find the 'Order Status' section",
          "Use the 'Update Status' dropdown to select: Pending, Processing, Ready for Pickup, Shipped, Delivered, Cancelled, Paid, or Payment Failed",
          "Optionally add or edit notes",
          "Click 'Save Changes' - the list refreshes automatically",
          "Note: Status changes to Processing, Ready for Pickup, Delivered, or Cancelled automatically send email notifications",
        ],
      },
      {
        title: "Quick Actions",
        content: [
          "Send Email: Opens your default email client",
          "Call Customer: Opens your phone dialer",
          "Send SMS: Opens your SMS app",
        ],
      },
    ],
  },
  {
    id: "customers",
    title: "Customers",
    icon: <Users className="h-5 w-5" />,
    content: [
      "Click the Customers icon in the left sidebar under Dashboard, or navigate to /admin/customers",
      "Search by customer name or email - filters in real-time",
      "View customer details: name, email, phone, total orders, total spent, last order date, country",
    ],
    subsections: [
      {
        title: "Viewing Details",
        content: [
          "Click any customer row to see all their orders and order history",
        ],
      },
      {
        title: "Pagination",
        content: [
          "10 customers per page",
          "Use page numbers or Previous/Next buttons",
          "Shows 'Showing X-Y of Z customers'",
        ],
      },
    ],
  },
  {
    id: "analytics",
    title: "Analytics",
    icon: <BarChart3 className="h-5 w-5" />,
    content: [
      "Click the Analytics icon in the left sidebar under Dashboard, or navigate to /admin/analytics",
      "View revenue chart with visual representation over time",
      "See top products list",
      "Review detailed revenue breakdown",
    ],
    subsections: [
      {
        title: "Using Filters",
        content: [
          "Use date range and filter options at the top",
          "Charts and data update automatically based on selected filters",
        ],
      },
    ],
  },
  {
    id: "settings",
    title: "Settings",
    icon: <Settings className="h-5 w-5" />,
    content: [
      "Click the Settings icon in the top right toolbar (gear icon), or navigate to /admin/settings",
    ],
    subsections: [
      {
        title: "Tax Settings",
        content: ["Configure sales tax rate percentage applied to all orders"],
      },
      {
        title: "Shipping Settings",
        content: [
          "Enable/disable shipping options",
          "Set pickup-only mode",
          "Configure shipping cost",
          "Set free shipping threshold",
          "Add pickup instructions",
        ],
      },
      {
        title: "Burndown Settings",
        content: [
          "Configure time thresholds for order urgency levels (urgent and critical)",
        ],
      },
      {
        title: "Saving Changes",
        content: [
          "After making changes, click 'Save Settings' at the bottom",
          "You'll see a success message confirming your changes",
        ],
      },
    ],
  },
];

const commonTasks = [
  {
    title: "Update an Order Status",
    steps: [
      "Go to Orders page",
      "Click on the order you want to update",
      "Select a new status from the dropdown",
      "Add any notes if needed",
      "Click 'Save Changes'",
    ],
  },
  {
    title: "Contact a Customer",
    steps: [
      "Open the order detail modal for the customer's order",
      "In Quick Actions, click: Send Email, Call Customer, or Send SMS",
    ],
  },
  {
    title: "Search for an Order",
    steps: [
      "Go to Orders page",
      "Type order number, customer name, or email in the search bar",
      "Results filter automatically",
    ],
  },
  {
    title: "Change Tax Rate",
    steps: [
      "Go to Settings",
      "Find the Tax Settings card",
      "Enter the new tax rate percentage",
      "Click 'Save Settings'",
    ],
  },
];

function HelpPageContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["overview", "orders"]),
  );

  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return helpSections;

    const query = searchQuery.toLowerCase();
    return helpSections
      .filter((section) => {
        const matchesTitle = section.title.toLowerCase().includes(query);
        const matchesContent = section.content.some((text) =>
          text.toLowerCase().includes(query),
        );
        const matchesSubsections = section.subsections?.some(
          (sub) =>
            sub.title.toLowerCase().includes(query) ||
            sub.content.some((text) => text.toLowerCase().includes(query)),
        );
        return matchesTitle || matchesContent || matchesSubsections;
      })
      .map((section) => {
        if (!searchQuery.trim()) return section;
        // Expand matching sections
        if (
          section.title.toLowerCase().includes(query) ||
          section.content.some((text) => text.toLowerCase().includes(query))
        ) {
          setExpandedSections((prev) => new Set(prev).add(section.id));
        }
        return section;
      });
  }, [searchQuery]);

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  return (
    <MainNav
      sidebar={AppSidebarNav}
      toolContent={
        <>
          <SettingsButton />
          <HelpButton />
        </>
      }
    >
      <PageContent title="Help & Guide">
        <PageWidthWrapper>
          <div className="space-y-6 pb-10">
            {/* Header */}
            <div className="space-y-3">
              <h1 className="text-3xl font-bold text-neutral-900">
                Dashboard Guide
              </h1>
              <p className="text-lg text-neutral-600">
                Learn how to navigate and use all features of your dashboard
              </p>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4 text-neutral-400"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.3-4.3"></path>
                </svg>
              </div>
              <Input
                type="text"
                placeholder="Search for help topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="peer w-full rounded-md border border-neutral-200 px-10 text-black outline-none transition-all placeholder:text-neutral-400 focus:border-neutral-500 focus:ring-4 focus:ring-neutral-200 sm:text-sm"
              />
            </div>

            {/* Quick Navigation */}
            {!searchQuery && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                {helpSections.slice(0, 4).map((section) => (
                  <Link
                    key={section.id}
                    href={`#${section.id}`}
                    onClick={() => {
                      setExpandedSections((prev) =>
                        new Set(prev).add(section.id),
                      );
                    }}
                    className="rounded-lg border border-neutral-200 bg-white p-4 transition-all hover:border-neutral-300 hover:shadow-sm"
                  >
                    <div className="mb-2 text-neutral-700">{section.icon}</div>
                    <h3 className="font-semibold text-neutral-900">
                      {section.title}
                    </h3>
                  </Link>
                ))}
              </div>
            )}

            {/* Help Sections */}
            <div className="space-y-3">
              {filteredSections.map((section) => {
                const isExpanded = expandedSections.has(section.id);
                return (
                  <Collapsible.Root
                    key={section.id}
                    open={isExpanded}
                    onOpenChange={() => toggleSection(section.id)}
                  >
                    <div
                      id={section.id}
                      className="overflow-hidden rounded-lg border border-neutral-200 bg-white"
                    >
                      <Collapsible.Trigger className="flex w-full items-center justify-between px-6 py-4 text-left transition-colors hover:bg-neutral-50">
                        <div className="flex items-center gap-3">
                          <div className="text-neutral-700">{section.icon}</div>
                          <h2 className="text-xl font-semibold text-neutral-900">
                            {section.title}
                          </h2>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5 text-neutral-400" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-neutral-400" />
                        )}
                      </Collapsible.Trigger>
                      <Collapsible.Content>
                        <div className="space-y-6 border-t border-neutral-100 px-6 pb-6 pt-2">
                          {/* Main Content */}
                          <div className="space-y-3 pt-4">
                            {section.content.map((text, idx) => (
                              <div key={idx} className="flex items-start gap-3">
                                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                                <p className="leading-relaxed text-neutral-700">
                                  {text}
                                </p>
                              </div>
                            ))}
                          </div>

                          {/* Subsections */}
                          {section.subsections?.map((subsection, subIdx) => (
                            <div key={subIdx} className="space-y-2 pt-2">
                              <h3 className="text-base font-semibold text-neutral-900">
                                {subsection.title}
                              </h3>
                              <div className="space-y-2 pl-2">
                                {subsection.content.map((text, textIdx) => (
                                  <div
                                    key={textIdx}
                                    className="flex items-start gap-3"
                                  >
                                    <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-neutral-400" />
                                    <p className="text-sm leading-relaxed text-neutral-600">
                                      {text}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </Collapsible.Content>
                    </div>
                  </Collapsible.Root>
                );
              })}
            </div>

            {/* Common Tasks */}
            {!searchQuery && (
              <section id="common-tasks" className="space-y-4">
                <h2 className="text-2xl font-bold text-neutral-900">
                  Common Tasks
                </h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {commonTasks.map((task, idx) => (
                    <div
                      key={idx}
                      className="space-y-3 rounded-lg border border-neutral-200 bg-white p-5"
                    >
                      <h3 className="font-semibold text-neutral-900">
                        {task.title}
                      </h3>
                      <ol className="list-inside list-decimal space-y-2 text-neutral-600">
                        {task.steps.map((step, stepIdx) => (
                          <li key={stepIdx} className="text-sm leading-relaxed">
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Support */}
            <section id="support" className="space-y-4">
              <h2 className="text-2xl font-bold text-neutral-900">
                Need More Help?
              </h2>
              <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-6">
                <p className="text-neutral-700">
                  If you need additional assistance or have questions not
                  covered in this guide, please contact support at{" "}
                  <a
                    href="mailto:kennedy@sovereigncreative.agency"
                    className="font-semibold text-neutral-900 underline"
                  >
                    kennedy@sovereigncreative.agency
                  </a>
                </p>
              </div>
            </section>
          </div>
        </PageWidthWrapper>
      </PageContent>
    </MainNav>
  );
}

export default function HelpPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-neutral-600">Loading...</div>
        </div>
      }
    >
      <HelpPageContent />
    </Suspense>
  );
}
