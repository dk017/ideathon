"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Plus, X } from "lucide-react";
import { toast } from "sonner";

interface IdeaCreationWizardProps {
  userId: string;
}

export function IdeaCreationWizard({ userId }: IdeaCreationWizardProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    skillsNeeded: [] as Array<{
      skillId: string;
      level: string;
      skillName: string;
    }>,
    hackathonId: "",
  });
  const [availableSkills, setAvailableSkills] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [availableEvents, setAvailableEvents] = useState<any[]>([]);
  const router = useRouter();

  const fetchSkills = async () => {
    try {
      const response = await fetch("/api/skills/all");
      if (!response.ok) {
        throw new Error("Failed to fetch skills");
      }
      const skills = await response.json();
      console.log("Fetched skills:", skills);
      setAvailableSkills(skills);
    } catch (error) {
      console.error("Error fetching skills:", error);
      toast.error("Failed to load skills. Please try again.");
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await fetch("/api/events");
      if (!response.ok) throw new Error("Failed to fetch events");
      const events = await response.json();
      setAvailableEvents(events);
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error("Failed to load events. Please try again.");
    }
  };

  useEffect(() => {
    fetchSkills();
    fetchEvents();
  }, []);

  const handleNext = () => {
    if (step === 1 && (!formData.title || !formData.description)) {
      toast.error("Please fill in all required fields");
      return;
    }

    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const addSkill = () => {
    if (!selectedSkill || !selectedLevel) {
      toast.error("Please select both skill and level");
      return;
    }

    const skill = availableSkills.find((s: any) => s.id === selectedSkill);
    if (!skill) return;

    const skillExists = formData.skillsNeeded.some(
      (s) => s.skillId === selectedSkill
    );
    if (skillExists) {
      toast.error("Skill already added");
      return;
    }

    setFormData({
      ...formData,
      skillsNeeded: [
        ...formData.skillsNeeded,
        {
          skillId: selectedSkill,
          level: selectedLevel,
          skillName: (skill as any).name,
        },
      ],
    });

    setSelectedSkill("");
    setSelectedLevel("");
  };

  const removeSkill = (skillId: string) => {
    setFormData({
      ...formData,
      skillsNeeded: formData.skillsNeeded.filter((s) => s.skillId !== skillId),
    });
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const response = await fetch("/api/ideas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          hackathonId:
            formData.hackathonId === "independent"
              ? null
              : formData.hackathonId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create idea");
      }

      const idea = await response.json();
      toast.success("Idea created successfully!");
      router.push(`/idea/${idea.id}`);
    } catch (error) {
      console.error("Error creating idea:", error);
      toast.error("Failed to create idea. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const progress = (step / 3) * 100;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <Progress value={progress} className="w-full" />
        <div className="flex justify-between text-sm text-muted-foreground mt-2">
          <span>Step {step} of 3</span>
          <span>{Math.round(progress)}% complete</span>
        </div>
      </div>

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Idea Title *</Label>
              <Input
                id="title"
                placeholder="Enter your idea title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe your idea in detail..."
                rows={6}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="event">Event (optional)</Label>
              <Select
                value={formData.hackathonId || "independent"}
                onValueChange={(val) =>
                  setFormData({ ...formData, hackathonId: val })
                }
              >
                <SelectTrigger id="event">
                  <SelectValue placeholder="Independent (no event)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="independent">
                    Independent (no event)
                  </SelectItem>
                  {availableEvents.map((event: any) => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Skills Needed</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Select value={selectedSkill} onValueChange={setSelectedSkill}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select a skill" />
                </SelectTrigger>
                <SelectContent>
                  {availableSkills.map((skill: any) => (
                    <SelectItem key={skill.id} value={skill.id}>
                      {skill.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BEGINNER">Beginner</SelectItem>
                  <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                  <SelectItem value="EXPERT">Expert</SelectItem>
                </SelectContent>
              </Select>

              <Button onClick={addSkill} size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {formData.skillsNeeded.length > 0 && (
              <div className="space-y-2">
                <Label>Added Skills:</Label>
                <div className="flex flex-wrap gap-2">
                  {formData.skillsNeeded.map((skill) => (
                    <Badge
                      key={skill.skillId}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {skill.skillName} ({skill.level.toLowerCase()})
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeSkill(skill.skillId)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Review & Submit</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Title:</Label>
              <p className="font-medium">{formData.title}</p>
            </div>

            <div>
              <Label>Description:</Label>
              <p className="text-sm text-muted-foreground">
                {formData.description}
              </p>
            </div>

            {formData.skillsNeeded.length > 0 && (
              <div>
                <Label>Skills Needed:</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.skillsNeeded.map((skill) => (
                    <Badge key={skill.skillId} variant="outline">
                      {skill.skillName} ({skill.level.toLowerCase()})
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between mt-6">
        {step > 1 && (
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        )}

        {step < 3 ? (
          <Button onClick={handleNext} className="ml-auto">
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={loading} className="ml-auto">
            {loading ? "Creating..." : "Create Idea"}
          </Button>
        )}
      </div>
    </div>
  );
}
