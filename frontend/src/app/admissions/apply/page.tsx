"use client";
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";

// Simulated Dynamic JSON Schema fetched from the FastAPI backend mapping to specific quotas
const formSchemaJson = {
    steps: [
        { id: "personal", title: "Personal Details", fields: [{ name: "fullName", type: "text", label: "Full Name", required: true }, { name: "email", type: "email", label: "Email Address", required: true }] },
        { id: "academic", title: "Academic Background", fields: [{ name: "highSchoolPercentage", type: "number", label: "12th Grade Percentage", required: true }] },
        { id: "documents", title: "Document Uploads", fields: [{ name: "marksheet", type: "file", label: "12th Marksheet (PDF)", required: true }] }
    ]
};

// Dynamic Zod Schema Generator enforcing strict frontend typing
const generateZodSchema = (steps: any) => {
    let schema: any = {};
    steps.forEach((step: any) => {
        step.fields.forEach((field: any) => {
            if (field.type === 'email') schema[field.name] = z.string().email();
            else if (field.type === 'number') schema[field.name] = z.coerce.number().min(0).max(100);
            else schema[field.name] = z.string().min(1, `${field.label} is required`);
        });
    });
    return z.object(schema);
};

export default function AdmissionsApplicationWizard() {
    const [currentStep, setCurrentStep] = useState(0);
    const dynamicSchema = generateZodSchema(formSchemaJson.steps);
    
    const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
        resolver: zodResolver(dynamicSchema),
        mode: "onChange"
    });

    // LocalStorage Data Resilience: Prevents data loss if the browser crashes during PDF uploads
    useEffect(() => {
        const savedData = localStorage.getItem('klmce_admission_draft');
        if (savedData) {
            const parsed = JSON.parse(savedData);
            Object.keys(parsed).forEach(key => setValue(key, parsed[key]));
        }
    }, [setValue]);

    useEffect(() => {
        const subscription = watch((value) => {
            localStorage.setItem('klmce_admission_draft', JSON.stringify(value));
        });
        return () => subscription.unsubscribe();
    }, [watch]);

    const onSubmit = async (data: any) => {
        console.log("Transmitting JSONB Payload to FastAPI:", data);
        localStorage.removeItem('klmce_admission_draft');
        // Await fetch('/api/v1/admissions/applications', ...)
    };

    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, formSchemaJson.steps.length - 1));
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));

    const progressPercentage = ((currentStep + 1) / formSchemaJson.steps.length) * 100;

    return (
        <div className="min-h-screen bg-[#0a0f1c] text-white flex items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#0a0f1c] to-[#0a0f1c]">
            <Card className="w-full max-w-2xl bg-white/5 border-white/10 backdrop-blur-xl shadow-2xl">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-rose-400">
                        KLMCE Admissions 2026
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                        Step {currentStep + 1} of {formSchemaJson.steps.length}: {formSchemaJson.steps[currentStep].title}
                    </CardDescription>
                    {/* Shadcn Progress Component */}
                    <Progress value={progressPercentage} className="h-2 mt-4 bg-white/10" />
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* Framer Motion micro-animations for sleek step transitions */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentStep}
                                initial={{ x: 20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -20, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-4"
                            >
                                {formSchemaJson.steps[currentStep].fields.map((field) => (
                                    <div key={field.name} className="flex flex-col space-y-2">
                                        <Label className="text-slate-300">{field.label}</Label>
                                        <Input 
                                            type={field.type === 'file' ? 'file' : field.type}
                                            {...register(field.name)}
                                            className="bg-black/20 border-white/10 text-white focus:ring-orange-500/50"
                                        />
                                        {errors[field.name] && <span className="text-red-400 text-sm">{errors[field.name]?.message as string}</span>}
                                    </div>
                                ))}
                            </motion.div>
                        </AnimatePresence>

                        <div className="flex justify-between pt-6">
                            <Button type="button" variant="outline" onClick={prevStep} disabled={currentStep === 0} className="border-white/10 text-slate-300 hover:bg-white/5">
                                Previous
                            </Button>
                            {currentStep === formSchemaJson.steps.length - 1 ? (
                                <Button type="submit" className="bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 border-0 shadow-lg shadow-orange-500/25">
                                    Submit Application
                                </Button>
                            ) : (
                                <Button type="button" onClick={nextStep} className="bg-white/10 hover:bg-white/20 text-white border-0">
                                    Next Step
                                </Button>
                            )}
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
