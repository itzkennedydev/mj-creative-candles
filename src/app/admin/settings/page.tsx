"use client";

import { MainNav } from "../../sca-dashboard/components/layout/main-nav";
import { AppSidebarNav } from "../../sca-dashboard/components/layout/sidebar/app-sidebar-nav";
import { HelpButton } from "../../sca-dashboard/components/layout/sidebar/help-button";
import { SettingsButton } from "../../sca-dashboard/components/layout/sidebar/settings-button";
import { PageContent } from "../../sca-dashboard/components/layout/page-content";
import { PageWidthWrapper } from "../../sca-dashboard/components/layout/page-width-wrapper";
import { Button } from "../../sca-dashboard/components/ui/button";
import { Input } from "../../sca-dashboard/components/ui/input";
import { useState, useEffect } from "react";
import { Settings, Save, DollarSign, Truck, Package, Clock, Lock, FolderSync } from "lucide-react";
import * as Switch from "@radix-ui/react-switch";

interface AdminSettings {
  taxRate: number;
  shippingEnabled: boolean;
  pickupOnly: boolean;
  freeShippingThreshold: number;
  shippingCost: number;
  pickupInstructions: string;
  pickupLocation: string;
  burndownUrgentThreshold: number;
  burndownCriticalThreshold: number;
}

export default function DashboardSettingsPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [settings, setSettings] = useState<AdminSettings>({
    taxRate: 8.5,
    shippingEnabled: true,
    pickupOnly: false,
    freeShippingThreshold: 50,
    shippingCost: 9.99,
    pickupInstructions: "Please call (309) 373-6017 to schedule pickup. Available Monday-Friday 9AM-5PM.",
    pickupLocation: "415 13th St, Moline, IL 61265",
    burndownUrgentThreshold: 120,
    burndownCriticalThreshold: 168,
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const token = sessionStorage.getItem('adminToken');
    if (!token) {
      window.location.href = '/admin/login';
      return;
    }
    setIsAuthenticated(!!token);
    void fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('adminToken');
      if (!token) return;

      const response = await fetch('/api/admin/settings', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = (await response.json()) as { settings: AdminSettings };
        if (data.settings) {
          setSettings(data.settings);
        }
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      setMessage({ type: 'error', text: 'Failed to load settings' });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const token = sessionStorage.getItem('adminToken');
      if (!token) return;

      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Settings saved successfully' });
      } else {
        setMessage({ type: 'error', text: 'Failed to save settings' });
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      setMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen w-full bg-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-semibold">Authentication Required</h1>
          <p className="text-neutral-500">Please log in to access the settings.</p>
        </div>
      </div>
    );
  }

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
      <PageContent title="Settings">
        <div className="pb-10">
          <PageWidthWrapper>
            <div className="grid grid-cols-1 gap-5">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-sm text-neutral-500">Loading settings...</p>
            </div>
          ) : (
            <>
              {/* Tax Settings Card */}
              <div className="rounded-lg border border-neutral-200 bg-white">
                <div className="relative p-5 sm:p-10">
                  <div className="flex flex-col space-y-3">
                    <h2 className="text-xl font-medium">Tax Settings</h2>
                    <p className="text-sm text-neutral-500">Configure sales tax rate for your orders.</p>
                  </div>
                  <div className="mt-8">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Tax Rate (%)
                      </label>
                      <Input
                        type="number"
                        step="0.1"
                        value={settings.taxRate}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            taxRate: parseFloat(e.target.value) || 0,
                          })
                        }
                        placeholder="8.5"
                        className="max-w-xs"
                      />
                      <p className="text-sm text-neutral-500 mt-1">
                        Sales tax rate percentage applied to all orders
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping Settings Card */}
              <div className="rounded-lg border border-neutral-200 bg-white">
                <div className="relative p-5 sm:p-10">
                  <div className="flex flex-col space-y-3">
                    <h2 className="text-xl font-medium">Shipping Settings</h2>
                    <p className="text-sm text-neutral-500">Configure shipping options and preferences for your orders.</p>
                  </div>
                  
                  <div className="mt-8 rounded-t-md border border-neutral-200 px-4 py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="rounded-full border border-neutral-200 p-2">
                          <Truck className="h-4 w-4 text-neutral-600" />
                        </div>
                        <div className="flex flex-col">
                          <h3 className="font-medium">Enable Shipping</h3>
                          <p className="text-sm text-neutral-500">Allow customers to select shipping option</p>
                        </div>
                      </div>
                      <div>
                        <Switch.Root
                          checked={settings.shippingEnabled}
                          onCheckedChange={(checked) =>
                            setSettings({ ...settings, shippingEnabled: checked })
                          }
                          className="radix-state-checked:bg-[#74CADC] radix-state-unchecked:bg-neutral-200 relative inline-flex h-4 w-8 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring focus-visible:ring-[#74CADC] focus-visible:ring-opacity-75"
                        >
                          <Switch.Thumb className="radix-state-checked:translate-x-4 radix-state-unchecked:translate-x-0 pointer-events-none h-3 w-3 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out" />
                        </Switch.Root>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-b-md border border-t-0 border-neutral-200 bg-neutral-50 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium text-neutral-700">Pickup Only Mode</label>
                    </div>
                    <Switch.Root
                      checked={settings.pickupOnly}
                      onCheckedChange={(checked) =>
                        setSettings({ ...settings, pickupOnly: checked })
                      }
                      className="radix-state-checked:bg-[#74CADC] radix-state-unchecked:bg-neutral-200 relative inline-flex h-4 w-8 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring focus-visible:ring-[#74CADC] focus-visible:ring-opacity-75"
                    >
                      <Switch.Thumb className="radix-state-checked:translate-x-4 radix-state-unchecked:translate-x-0 pointer-events-none h-3 w-3 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out" />
                    </Switch.Root>
                  </div>

                  {!settings.pickupOnly && (
                    <>
                      <div className="mt-4 px-4 space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-2">
                            Shipping Cost ($)
                          </label>
                          <Input
                            type="number"
                            step="0.01"
                            value={settings.shippingCost}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                shippingCost: parseFloat(e.target.value) || 0,
                              })
                            }
                            placeholder="9.99"
                            className="max-w-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-2">
                            Free Shipping Threshold ($)
                          </label>
                          <Input
                            type="number"
                            step="0.01"
                            value={settings.freeShippingThreshold}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                freeShippingThreshold: parseFloat(e.target.value) || 0,
                              })
                            }
                            placeholder="50"
                            className="max-w-xs"
                          />
                          <p className="text-sm text-neutral-500 mt-1">
                            Orders above this amount get free shipping
                          </p>
                        </div>
                      </div>
                    </>
                  )}

                  <div className="mt-4 px-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Pickup Location
                      </label>
                      <Input
                        type="text"
                        value={settings.pickupLocation}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            pickupLocation: e.target.value,
                          })
                        }
                        placeholder="415 13th St, Moline, IL 61265"
                        className="w-full"
                      />
                      <p className="text-sm text-neutral-500 mt-1">
                        Address where customers can pick up their orders
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Pickup Instructions
                    </label>
                      <textarea
                        value={settings.pickupInstructions}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            pickupInstructions: e.target.value,
                          })
                        }
                        placeholder="Please call (309) 373-6017 to schedule pickup..."
                        className="w-full px-3 py-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-200 focus:border-neutral-500 text-sm"
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Burndown Settings Card */}
              <div className="rounded-lg border border-neutral-200 bg-white">
                <div className="relative flex flex-col space-y-6 p-5 sm:p-10">
                  <div className="flex flex-col space-y-3">
                    <h2 className="text-xl font-medium">Burndown Settings</h2>
                    <p className="text-sm text-neutral-500">Configure time thresholds for order urgency levels.</p>
                  </div>
                  
                  <div className="mt-2 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Urgent Threshold (hours)
                      </label>
                      <Input
                        type="number"
                        value={settings.burndownUrgentThreshold}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            burndownUrgentThreshold: parseInt(e.target.value) || 0,
                          })
                        }
                        placeholder="120"
                        className="max-w-xs"
                      />
                      <p className="text-sm text-neutral-500 mt-1">
                        Hours before order is marked as urgent
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Critical Threshold (hours)
                      </label>
                      <Input
                        type="number"
                        value={settings.burndownCriticalThreshold}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            burndownCriticalThreshold: parseInt(e.target.value) || 0,
                          })
                        }
                        placeholder="168"
                        className="max-w-xs"
                      />
                      <p className="text-sm text-neutral-500 mt-1">
                        Hours before order is marked as critical (must be greater than urgent threshold)
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              {message && (
                <div
                  className={`p-3 rounded-md ${
                    message.type === 'success'
                      ? 'bg-green-50 text-green-800'
                      : 'bg-red-50 text-red-800'
                  }`}
                >
                  {message.text}
                </div>
              )}

              <div className="flex justify-end">
                <Button
                  onClick={() => void saveSettings()}
                  disabled={saving}
                  variant="primary"
                  icon={<Save className="h-4 w-4" />}
                  text={saving ? 'Saving...' : 'Save Settings'}
                  className="h-8 w-auto px-5"
                />
              </div>
            </>
          )}
            </div>
          </PageWidthWrapper>
        </div>
      </PageContent>
    </MainNav>
  );
}

