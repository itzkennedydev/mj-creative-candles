"use client";

import React, { useState } from "react";
import { Button } from "~/components/ui/button";
import { ArrowRight, CheckCircle, Calendar, MapPin, Users, Clock } from "lucide-react";

interface FormData {
  eventType: string;
  attendees: string;
  location: string;
  date: string;
}

interface AppointmentFormProps {
  onClose: () => void;
}

export function AppointmentForm({ onClose }: AppointmentFormProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    eventType: "",
    attendees: "",
    location: "",
    date: "",
  });

  const handleNext = () => {
    if (step < 5) {
      setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSelect = (field: keyof FormData, value: string) => {
    setFormData({ ...formData, [field]: value });
    setTimeout(handleNext, 400);
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-[600px] bg-white rounded-xl overflow-hidden">
      {/* Left Side - Info */}
      <div className="w-full lg:w-5/12 bg-[#F8FAFC] p-8 lg:p-12">
        <div className="max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-[#0A5565] mb-6">Book Your Event</h2>
          <p className="text-gray-600 mb-8">
            We bring professional embroidery services directly to your event. Fill out the form to get started.
          </p>
          
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="bg-[#74CADC]/20 p-2 rounded-lg">
                <CheckCircle className="h-6 w-6 text-[#0A5565]" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-1">On-site Service</h3>
                <p className="text-sm text-gray-600">We bring all equipment to your location</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="bg-[#74CADC]/20 p-2 rounded-lg">
                <Users className="h-6 w-6 text-[#0A5565]" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-1">Perfect for Groups</h3>
                <p className="text-sm text-gray-600">Great for teams, schools, and corporate events</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="bg-[#74CADC]/20 p-2 rounded-lg">
                <Calendar className="h-6 w-6 text-[#0A5565]" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-1">Flexible Scheduling</h3> 
                <p className="text-sm text-gray-600">Book at your convenience</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right Side - Form */}
      <div className="w-full lg:w-7/12 p-8 lg:p-12">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex-1">
                    <div 
                      className={`h-1 rounded-full transition-all duration-300
                      ${i <= step ? "bg-[#74CADC]" : "bg-gray-200"}`}
                    />
                  </div>
                ))}
              </div>
            </div>
            <span className="ml-4 text-sm font-medium text-gray-500">Step {step} of 5</span>
          </div>
          
          <div className="min-h-[400px]">
            {/* Step 1 - Event Type */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">What type of event do you need embroidery for?</h2>
                  <p className="text-gray-600">Select the type of event you&apos;re planning</p>
                </div>
                
                <div className="grid gap-4">
                  {["School Event", "Sports Team", "Corporate Event", "Birthday/Celebration", "Other"].map((type) => (
                    <button
                      key={type}
                      onClick={() => handleSelect("eventType", type)}
                      className={`p-4 rounded-xl border transition-all duration-200 text-left
                        ${formData.eventType === type 
                          ? "border-[#74CADC] bg-[#74CADC]/10" 
                          : "border-gray-200 hover:border-[#74CADC] hover:bg-[#74CADC]/10"}`}
                    >
                      <span className="font-medium text-gray-900">{type}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Step 2 - Expected Attendees */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">How many attendees do you expect?</h2>
                  <p className="text-gray-600">This helps us determine the equipment needed</p>
                </div>
                
                <div className="grid gap-4">
                  {["Less than 25", "25-50", "51-100", "101-200", "More than 200"].map((count) => (
                    <button
                      key={count}
                      onClick={() => handleSelect("attendees", count)}
                      className={`p-4 rounded-xl border transition-all duration-200 text-left
                        ${formData.attendees === count 
                          ? "border-[#74CADC] bg-[#74CADC]/10" 
                          : "border-gray-200 hover:border-[#74CADC] hover:bg-[#74CADC]/10"}`}
                    >
                      <div className="flex items-center gap-3">
                        <Users className="h-5 w-5 text-[#0A5565]" />
                        <span className="font-medium text-gray-900">{count}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Step 3 - Location */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Where is your event located?</h2>
                  <p className="text-gray-600">We service the Quad Cities and surrounding areas</p>
                </div>
                
                <div className="grid gap-4">
                  {["Moline, IL", "Rock Island, IL", "Davenport, IA", "Bettendorf, IA", "Other location (we'll discuss details)"].map((location) => (
                    <button
                      key={location}
                      onClick={() => handleSelect("location", location)}
                      className={`p-4 rounded-xl border transition-all duration-200 text-left
                        ${formData.location === location 
                          ? "border-[#74CADC] bg-[#74CADC]/10" 
                          : "border-gray-200 hover:border-[#74CADC] hover:bg-[#74CADC]/10"}`}
                    >
                      <div className="flex items-center gap-3">
                        <MapPin className="h-5 w-5 text-[#0A5565]" />
                        <span className="font-medium text-gray-900">{location}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Step 4 - Date Range */}
            {step === 4 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">When are you planning your event?</h2>
                  <p className="text-gray-600">Select an approximate timeframe</p>
                </div>
                
                <div className="grid gap-4">
                  {["Within 1 month", "1-2 months from now", "3-6 months from now", "More than 6 months away", "Not sure yet"].map((timeframe) => (
                    <button
                      key={timeframe}
                      onClick={() => handleSelect("date", timeframe)}
                      className={`p-4 rounded-xl border transition-all duration-200 text-left
                        ${formData.date === timeframe 
                          ? "border-[#74CADC] bg-[#74CADC]/10" 
                          : "border-gray-200 hover:border-[#74CADC] hover:bg-[#74CADC]/10"}`}
                    >
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-[#0A5565]" />
                        <span className="font-medium text-gray-900">{timeframe}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Step 5 - Schedule Call */}
            {step === 5 && (
              <div className="space-y-8">
                <div className="text-center">
                  <div className="inline-block p-4 bg-[#74CADC]/20 rounded-full mb-4">
                    <Clock className="h-10 w-10 text-[#0A5565]" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Select a time to discuss your event</h2>
                  <p className="text-gray-600">Choose a convenient time for a quick 15-minute call</p>
                </div>
                
                <div className="bg-[#F8FAFC] p-6 rounded-xl">
                  <h3 className="font-medium text-gray-900 mb-4">Your Event Details</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="text-gray-500 w-32">Event Type:</span>
                      <span className="font-medium text-gray-900">{formData.eventType}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-500 w-32">Attendees:</span>
                      <span className="font-medium text-gray-900">{formData.attendees}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-500 w-32">Location:</span>
                      <span className="font-medium text-gray-900">{formData.location}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-500 w-32">Timeframe:</span>
                      <span className="font-medium text-gray-900">{formData.date}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <p className="text-gray-600 mb-4">Connect with Calendly to schedule your consultation</p>
                  <Button 
                    size="lg" 
                    className="w-full bg-[#0A5565] hover:bg-[#083d4a] text-white font-semibold rounded-xl py-3"
                    onClick={onClose}
                  >
                    Schedule Consultation
                    <Calendar className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-12 flex justify-between">
            {step > 1 ? (
              <Button 
                onClick={handlePrevious}
                variant="outline" 
                className="border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                Back
              </Button>
            ) : (
              <div></div>
            )}
            
            {step < 5 && (
              <Button 
                onClick={handleNext}
                className="bg-[#0A5565] hover:bg-[#083d4a] text-white font-medium rounded-xl"
              >
                Continue
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 