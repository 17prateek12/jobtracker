import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getResumeById, createBuiltResume } from "../api/resume";
import { improveText } from "../api/ai";

interface ExperienceItem {
    company: string;
    role: string;
    duration: string;
    description: string;
}

interface ProjectItem {
    title: string;
    description: string;
    techStack: string[];
    liveLink?: string;
    githubLink?: string;
}

interface EducationItem {
    school: string;
    degree: string;
    year: string;
}

export default function ResumeBuilder() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [searchParams] = useSearchParams();

    // Editor tabs: 'summary' | 'experience' | 'projects' | 'skills' | 'education' | 'certifications'
    const [activeTab, setActiveTab] = useState<string>(searchParams.get("tab") || "summary");

    // AI Polishing state & handlers
    const [polishingField, setPolishingField] = useState<string | null>(null);

    const handleImproveText = async (section: "summary") => {
        if (section === "summary" && !summary.trim()) return;
        setPolishingField("summary");
        try {
            const result = await improveText(summary, "Professional summary profile section of CV/resume");
            setSummary(result);
        } catch (err: any) {
            console.error("Summary polish failed:", err);
            alert("Failed to polish summary.");
        } finally {
            setPolishingField(null);
        }
    };

    const handleImproveExperience = async (index: number) => {
        const text = experience[index].description;
        if (!text.trim()) return;
        setPolishingField(`exp-${index}`);
        try {
            const result = await improveText(text, `Work experience details for role ${experience[index].role} at ${experience[index].company}`);
            updateExperience(index, "description", result);
        } catch (err: any) {
            console.error("Experience polish failed:", err);
            alert("Failed to polish experience achievements.");
        } finally {
            setPolishingField(null);
        }
    };

    const handleImproveProject = async (index: number) => {
        const text = projects[index].description;
        if (!text.trim()) return;
        setPolishingField(`proj-${index}`);
        try {
            const result = await improveText(text, `Project details for personal project: ${projects[index].title}`);
            updateProject(index, "description", result);
        } catch (err: any) {
            console.error("Project polish failed:", err);
            alert("Failed to polish project description.");
        } finally {
            setPolishingField(null);
        }
    };

    // Form fields
    const [name, setName] = useState<string>("");
    const [summary, setSummary] = useState<string>("");
    const [experience, setExperience] = useState<ExperienceItem[]>([]);
    const [projects, setProjects] = useState<ProjectItem[]>([]);
    const [skills, setSkills] = useState<string[]>([]);
    const [education, setEducation] = useState<EducationItem[]>([]);
    const [certifications, setCertifications] = useState<string[]>([]);

    // Skill & Cert input helpers
    const [skillInput, setSkillInput] = useState<string>("");
    const [certInput, setCertInput] = useState<string>("");

    // Load existing resume data if editing
    const { data: existingResume, isLoading } = useQuery({
        queryKey: ["resume", id],
        queryFn: () => getResumeById(id!),
        enabled: !!id,
    });

    useEffect(() => {
        if (existingResume && existingResume.type === "BUILT" && existingResume.structuredData) {
            setName(existingResume.name || "");
            const sd = existingResume.structuredData;
            setSummary(sd.summary || "");
            setExperience(sd.experience || []);
            setProjects((sd.projects || []).map((p: any) => ({
                title: p.title || "",
                description: p.description || "",
                techStack: p.techStack || [],
                liveLink: p.liveLink || "",
                githubLink: p.githubLink || "",
            })));
            setSkills(sd.skills || []);
            setEducation(sd.education || []);
            setCertifications(sd.certifications || []);
        }
    }, [existingResume]);

    // Mutation to save resume
    const saveMutation = useMutation({
        mutationFn: (payload: { name: string; structuredData: any }) =>
            createBuiltResume(payload.name, payload.structuredData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["resumes"] });
            navigate("/resumes");
        },
        onError: (err: any) => {
            alert(err?.response?.data?.message || "Failed to save resume");
        },
    });

    const handleSave = () => {
        if (!name.trim()) {
            alert("Please enter a Resume Name (e.g. Backend Engineer Resume)");
            return;
        }

        const structuredData = {
            summary,
            experience,
            projects,
            skills,
            education,
            certifications,
        };

        saveMutation.mutate({
            name: name.trim(),
            structuredData,
        });
    };

    // Experience utilities
    const addExperience = () => {
        setExperience([...experience, { company: "", role: "", duration: "", description: "" }]);
    };

    const updateExperience = (index: number, field: keyof ExperienceItem, value: string) => {
        const updated = [...experience];
        updated[index][field] = value;
        setExperience(updated);
    };

    const removeExperience = (index: number) => {
        setExperience(experience.filter((_, i) => i !== index));
    };

    // Project utilities
    const addProject = () => {
        setProjects([...projects, { title: "", description: "", techStack: [], liveLink: "", githubLink: "" }]);
    };

    const updateProject = (index: number, field: keyof ProjectItem, value: any) => {
        const updated = [...projects];
        updated[index] = { ...updated[index], [field]: value };
        setProjects(updated);
    };

    const removeProject = (index: number) => {
        setProjects(projects.filter((_, i) => i !== index));
    };

    // Skills utilities
    const addSkill = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && skillInput.trim()) {
            e.preventDefault();
            if (!skills.includes(skillInput.trim())) {
                setSkills([...skills, skillInput.trim()]);
            }
            setSkillInput("");
        }
    };

    const removeSkill = (tag: string) => {
        setSkills(skills.filter(s => s !== tag));
    };

    // Education utilities
    const addEducation = () => {
        setEducation([...education, { school: "", degree: "", year: "" }]);
    };

    const updateEducation = (index: number, field: keyof EducationItem, value: string) => {
        const updated = [...education];
        updated[index][field] = value;
        setEducation(updated);
    };

    const removeEducation = (index: number) => {
        setEducation(education.filter((_, i) => i !== index));
    };

    // Certifications utilities
    const addCert = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && certInput.trim()) {
            e.preventDefault();
            if (!certifications.includes(certInput.trim())) {
                setCertifications([...certifications, certInput.trim()]);
            }
            setCertInput("");
        }
    };

    const removeCert = (tag: string) => {
        setCertifications(certifications.filter(c => c !== tag));
    };

    if (isLoading) {
        return (
            <div style={styles.centerContainer}>
                <h2>Loading resume editor...</h2>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <button onClick={() => navigate(-1)} style={styles.backBtn}>
                    &larr; Back to Library
                </button>
                <div style={styles.headerActions}>
                    <h1 style={{ margin: 0, fontSize: "28px", color: "var(--text-h)" }}>
                        {id ? `Edit Online Resume (v${existingResume?.version || 1})` : "Create Online Resume"}
                    </h1>
                    <div style={styles.buttonGroup}>
                        <button onClick={() => navigate("/resumes")} className="btn btn-secondary">
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="btn btn-primary"
                            disabled={saveMutation.isPending}
                        >
                            {saveMutation.isPending ? "Saving..." : "Save Resume"}
                        </button>
                    </div>
                </div>
            </div>

            <div style={styles.formGroup}>
                <label style={styles.label}>Resume Track Name *</label>
                <input
                    type="text"
                    style={styles.input}
                    placeholder="e.g. Backend Dev Resume, Frontend Engineer"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
                <span style={styles.helpText}>
                    * Saving changes to an existing track name automatically increments the version to preserve history.
                </span>
            </div>

            {/* Tab Links */}
            <div style={styles.tabs}>
                {[
                    { id: "summary", label: "Summary Profile" },
                    { id: "experience", label: "Work Experience" },
                    { id: "projects", label: "Projects" },
                    { id: "skills", label: "Core Skills" },
                    { id: "education", label: "Education" },
                    { id: "certifications", label: "Certifications" },
                    { id: "preview", label: "📄 Preview & Export" },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            ...styles.tabBtn,
                            ...(activeTab === tab.id ? styles.activeTabBtn : {}),
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Contents */}
            <div style={styles.tabContentPanel}>
                {/* 1. SUMMARY TAB */}
                {activeTab === "summary" && (
                    <div style={styles.tabPane}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <h3 style={styles.paneTitle}>Professional Summary</h3>
                            {summary.trim() && (
                                <button
                                    type="button"
                                    onClick={() => handleImproveText("summary")}
                                    disabled={polishingField === "summary"}
                                    style={styles.aiPolishBtn}
                                >
                                    {polishingField === "summary" ? "Polishing..." : "✨ AI Polish Summary"}
                                </button>
                            )}
                        </div>
                        <p style={styles.paneDesc}>
                            Write a brief, compelling introduction highlighting your core value proposition and career goals.
                        </p>
                        <textarea
                            style={styles.textarea}
                            rows={8}
                            placeholder="Highly motivated Software Engineer with 5+ years experience developing robust APIs and microservices..."
                            value={summary}
                            onChange={(e) => setSummary(e.target.value)}
                        />
                    </div>
                )}

                {/* 2. EXPERIENCE TAB */}
                {activeTab === "experience" && (
                    <div style={styles.tabPane}>
                        <div style={styles.paneHeader}>
                            <h3 style={styles.paneTitle}>Work Experience</h3>
                            <button onClick={addExperience} className="btn btn-primary" style={styles.addBtn}>
                                + Add Experience
                            </button>
                        </div>
                        {experience.length === 0 ? (
                            <p style={styles.emptyText}>No experience items added yet.</p>
                        ) : (
                            <div style={styles.list}>
                                {experience.map((exp, index) => (
                                    <div key={index} style={styles.itemCard}>
                                        <div style={styles.itemHeader}>
                                            <h4>Job Profile #{index + 1}</h4>
                                            <button onClick={() => removeExperience(index)} style={styles.removeBtn}>
                                                Remove
                                            </button>
                                        </div>
                                        <div style={styles.formGrid}>
                                            <div style={styles.formGroupHalf}>
                                                <label style={styles.fieldLabel}>Company Name</label>
                                                <input
                                                    type="text"
                                                    style={styles.input}
                                                    placeholder="Google"
                                                    value={exp.company}
                                                    onChange={(e) => updateExperience(index, "company", e.target.value)}
                                                />
                                            </div>
                                            <div style={styles.formGroupHalf}>
                                                <label style={styles.fieldLabel}>Job Role / Title</label>
                                                <input
                                                    type="text"
                                                    style={styles.input}
                                                    placeholder="Software Engineer"
                                                    value={exp.role}
                                                    onChange={(e) => updateExperience(index, "role", e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <div style={styles.formGroup}>
                                            <label style={styles.fieldLabel}>Duration / Dates</label>
                                            <input
                                                type="text"
                                                style={styles.input}
                                                placeholder="June 2022 - Present"
                                                value={exp.duration}
                                                onChange={(e) => updateExperience(index, "duration", e.target.value)}
                                            />
                                        </div>
                                        <div style={styles.formGroup}>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                <label style={styles.fieldLabel}>Description & Core Achievements</label>
                                                {exp.description.trim() && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleImproveExperience(index)}
                                                        disabled={polishingField === `exp-${index}`}
                                                        style={styles.aiPolishBtn}
                                                    >
                                                        {polishingField === `exp-${index}` ? "Polishing..." : "✨ AI Polish Description"}
                                                    </button>
                                                )}
                                            </div>
                                            <textarea
                                                style={styles.textarea}
                                                rows={4}
                                                placeholder="- Managed a backend team to ship a search pipeline reduction by 30%..."
                                                value={exp.description}
                                                onChange={(e) => updateExperience(index, "description", e.target.value)}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* 3. PROJECTS TAB */}
                {activeTab === "projects" && (
                    <div style={styles.tabPane}>
                        <div style={styles.paneHeader}>
                            <h3 style={styles.paneTitle}>Personal & Professional Projects</h3>
                            <button onClick={addProject} className="btn btn-primary" style={styles.addBtn}>
                                + Add Project
                            </button>
                        </div>
                        {projects.length === 0 ? (
                            <p style={styles.emptyText}>No projects added yet.</p>
                        ) : (
                            <div style={styles.list}>
                                {projects.map((proj, index) => (
                                    <div key={index} style={styles.itemCard}>
                                        <div style={styles.itemHeader}>
                                            <h4>Project #{index + 1}</h4>
                                            <button onClick={() => removeProject(index)} style={styles.removeBtn}>
                                                Remove
                                            </button>
                                        </div>
                                        <div style={styles.formGroup}>
                                            <label style={styles.fieldLabel}>Project Title</label>
                                            <input
                                                type="text"
                                                style={styles.input}
                                                placeholder="Local S3 CRM Emulator"
                                                value={proj.title}
                                                onChange={(e) => updateProject(index, "title", e.target.value)}
                                            />
                                        </div>
                                        <div style={styles.formGroup}>
                                            <label style={styles.fieldLabel}>Tech Stack (Comma-separated)</label>
                                            <input
                                                type="text"
                                                style={styles.input}
                                                placeholder="React, TypeScript, Docker, S3"
                                                value={proj.techStack ? proj.techStack.join(", ") : ""}
                                                onChange={(e) =>
                                                    updateProject(
                                                        index,
                                                        "techStack",
                                                        e.target.value.split(",").map((s: string) => s.trim())
                                                    )
                                                }
                                            />
                                        </div>
                                        <div style={styles.formGrid}>
                                            <div style={styles.formGroupHalf}>
                                                <label style={styles.fieldLabel}>Live Demo Link (Optional)</label>
                                                <input
                                                    type="url"
                                                    style={styles.input}
                                                    placeholder="https://myproject.com"
                                                    value={proj.liveLink || ""}
                                                    onChange={(e) => updateProject(index, "liveLink", e.target.value)}
                                                />
                                            </div>
                                            <div style={styles.formGroupHalf}>
                                                <label style={styles.fieldLabel}>GitHub Repo Link (Optional)</label>
                                                <input
                                                    type="url"
                                                    style={styles.input}
                                                    placeholder="https://github.com/user/repo"
                                                    value={proj.githubLink || ""}
                                                    onChange={(e) => updateProject(index, "githubLink", e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <div style={styles.formGroup}>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                <label style={styles.fieldLabel}>Project Details</label>
                                                {proj.description.trim() && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleImproveProject(index)}
                                                        disabled={polishingField === `proj-${index}`}
                                                        style={styles.aiPolishBtn}
                                                    >
                                                        {polishingField === `proj-${index}` ? "Polishing..." : "✨ AI Polish Details"}
                                                    </button>
                                                )}
                                            </div>
                                            <textarea
                                                style={styles.textarea}
                                                rows={3}
                                                placeholder="Built a cloud emulator mapping local S3 requests to a container instance..."
                                                value={proj.description}
                                                onChange={(e) => updateProject(index, "description", e.target.value)}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* 4. SKILLS TAB */}
                {activeTab === "skills" && (
                    <div style={styles.tabPane}>
                        <h3 style={styles.paneTitle}>Core Skills</h3>
                        <p style={styles.paneDesc}>Type a skill name and press <strong>Enter</strong> to add it to your profile tags.</p>
                        <input
                            type="text"
                            style={{ ...styles.input, marginBottom: "16px" }}
                            placeholder="Add skill... (e.g. Node.js)"
                            value={skillInput}
                            onChange={(e) => setSkillInput(e.target.value)}
                            onKeyDown={addSkill}
                        />
                        <div style={styles.tagGrid}>
                            {skills.length === 0 ? (
                                <p style={styles.emptyText}>No skills added yet.</p>
                            ) : (
                                skills.map((tag) => (
                                    <span key={tag} style={styles.tagBadge}>
                                        {tag}
                                        <button onClick={() => removeSkill(tag)} style={styles.tagCloseBtn}>
                                            &times;
                                        </button>
                                    </span>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* 5. EDUCATION TAB */}
                {activeTab === "education" && (
                    <div style={styles.tabPane}>
                        <div style={styles.paneHeader}>
                            <h3 style={styles.paneTitle}>Education Background</h3>
                            <button onClick={addEducation} className="btn btn-primary" style={styles.addBtn}>
                                + Add School
                            </button>
                        </div>
                        {education.length === 0 ? (
                            <p style={styles.emptyText}>No education background added yet.</p>
                        ) : (
                            <div style={styles.list}>
                                {education.map((edu, index) => (
                                    <div key={index} style={styles.itemCard}>
                                        <div style={styles.itemHeader}>
                                            <h4>School #{index + 1}</h4>
                                            <button onClick={() => removeEducation(index)} style={styles.removeBtn}>
                                                Remove
                                            </button>
                                        </div>
                                        <div style={styles.formGrid}>
                                            <div style={styles.formGroupHalf}>
                                                <label style={styles.fieldLabel}>University / School</label>
                                                <input
                                                    type="text"
                                                    style={styles.input}
                                                    placeholder="Stanford University"
                                                    value={edu.school}
                                                    onChange={(e) => updateEducation(index, "school", e.target.value)}
                                                />
                                            </div>
                                            <div style={styles.formGroupHalf}>
                                                <label style={styles.fieldLabel}>Degree / Major</label>
                                                <input
                                                    type="text"
                                                    style={styles.input}
                                                    placeholder="B.S. Computer Science"
                                                    value={edu.degree}
                                                    onChange={(e) => updateEducation(index, "degree", e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <div style={styles.formGroup}>
                                            <label style={styles.fieldLabel}>Graduation Year</label>
                                            <input
                                                type="text"
                                                style={styles.input}
                                                placeholder="2024"
                                                value={edu.year}
                                                onChange={(e) => updateEducation(index, "year", e.target.value)}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* 6. CERTIFICATIONS TAB */}
                {activeTab === "certifications" && (
                    <div style={styles.tabPane}>
                        <h3 style={styles.paneTitle}>Certifications</h3>
                        <p style={styles.paneDesc}>Type certification names (e.g. AWS Certified Solutions Architect) and press <strong>Enter</strong>.</p>
                        <input
                            type="text"
                            style={{ ...styles.input, marginBottom: "16px" }}
                            placeholder="Add certification..."
                            value={certInput}
                            onChange={(e) => setCertInput(e.target.value)}
                            onKeyDown={addCert}
                        />
                        <div style={styles.tagGrid}>
                            {certifications.length === 0 ? (
                                <p style={styles.emptyText}>No certifications listed yet.</p>
                            ) : (
                                certifications.map((tag) => (
                                    <span key={tag} style={{ ...styles.tagBadge, background: "#fef3c7", color: "#d97706", borderColor: "#fcd34d" }}>
                                        {tag}
                                        <button onClick={() => removeCert(tag)} style={{ ...styles.tagCloseBtn, color: "#d97706" }}>
                                            &times;
                                        </button>
                                    </span>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* 7. PREVIEW & EXPORT TAB */}
                {activeTab === "preview" && (
                    <div style={styles.tabPane}>
                        <div className="no-print" style={styles.previewActionsHeader}>
                            <p style={{ margin: 0, fontSize: "14px", color: "var(--text)" }}>
                                Review your resume layout below. Click the button to open your browser's Print Dialog and select <strong>"Save as PDF"</strong>.
                            </p>
                            <button
                                onClick={() => window.print()}
                                className="btn btn-primary"
                                style={styles.printBtn}
                            >
                                🖨️ Save as PDF / Print
                            </button>
                        </div>

                        <style>{`
                            @media print {
                                body * {
                                    visibility: hidden;
                                }
                                #print-resume-container, #print-resume-container * {
                                    visibility: visible;
                                }
                                #print-resume-container {
                                    position: absolute;
                                    left: 0;
                                    top: 0;
                                    width: 100%;
                                    padding: 40px !important;
                                    margin: 0 !important;
                                    background: #fff !important;
                                    color: #111827 !important;
                                    box-shadow: none !important;
                                    border: none !important;
                                }
                                .no-print {
                                    display: none !important;
                                }
                            }
                        `}</style>

                        <div id="print-resume-container" style={styles.printResumePaper}>
                            <div style={styles.printHeader}>
                                <h1 style={styles.printName}>{name || "Your Name"}</h1>
                                <p style={styles.printSub}>Structured Digital Resume Profile</p>
                            </div>

                            {summary && (
                                <div style={styles.printSection}>
                                    <h3 style={styles.printSecTitle}>Professional Profile</h3>
                                    <div style={styles.printSecDivider} />
                                    <p style={styles.printSummaryBody}>{summary}</p>
                                </div>
                            )}

                            {experience && experience.length > 0 && (
                                <div style={styles.printSection}>
                                    <h3 style={styles.printSecTitle}>Work Experience</h3>
                                    <div style={styles.printSecDivider} />
                                    {experience.map((exp, idx) => (
                                        <div key={idx} style={styles.printItem}>
                                            <div style={styles.printItemHeader}>
                                                <strong style={styles.printItemTitle}>{exp.role}</strong>
                                                <span style={styles.printItemMeta}>{exp.duration}</span>
                                            </div>
                                            <div style={styles.printItemSubHeader}>
                                                <span style={styles.printItemCompany}>{exp.company}</span>
                                            </div>
                                            {exp.description && (
                                                <p style={styles.printItemDesc}>{exp.description}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {projects && projects.length > 0 && (
                                <div style={styles.printSection}>
                                    <h3 style={styles.printSecTitle}>Projects</h3>
                                    <div style={styles.printSecDivider} />
                                    {projects.map((proj, idx) => (
                                        <div key={idx} style={styles.printItem}>
                                            <div style={styles.printItemHeader}>
                                                <strong style={styles.printItemTitle}>{proj.title}</strong>
                                                {proj.techStack && proj.techStack.length > 0 && (
                                                    <span style={styles.printItemTech}>[{proj.techStack.join(", ")}]</span>
                                                )}
                                            </div>
                                            {(proj.liveLink || proj.githubLink) && (
                                                <div style={styles.printItemLinksRow}>
                                                    {proj.liveLink && (
                                                        <a href={proj.liveLink.startsWith("http") ? proj.liveLink : `https://${proj.liveLink}`} target="_blank" rel="noopener noreferrer" style={styles.printLink}>
                                                            🔗 Live Demo
                                                        </a>
                                                    )}
                                                    {proj.liveLink && proj.githubLink && <span style={{ color: "#d1d5db", margin: "0 6px" }}> | </span>}
                                                    {proj.githubLink && (
                                                        <a href={proj.githubLink.startsWith("http") ? proj.githubLink : `https://${proj.githubLink}`} target="_blank" rel="noopener noreferrer" style={styles.printLink}>
                                                            💻 GitHub Repo
                                                        </a>
                                                    )}
                                                </div>
                                            )}
                                            {proj.description && (
                                                <p style={styles.printItemDesc}>{proj.description}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {skills && skills.length > 0 && (
                                <div style={styles.printSection}>
                                    <h3 style={styles.printSecTitle}>Technical Skills</h3>
                                    <div style={styles.printSecDivider} />
                                    <p style={styles.printSkillsList}>{skills.join(" • ")}</p>
                                </div>
                            )}

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                                {education && education.length > 0 && (
                                    <div style={styles.printSection}>
                                        <h3 style={styles.printSecTitle}>Education</h3>
                                        <div style={styles.printSecDivider} />
                                        {education.map((edu, idx) => (
                                            <div key={idx} style={{ marginBottom: "10px" }}>
                                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                                    <strong>{edu.degree}</strong>
                                                    <span style={styles.printItemMeta}>{edu.year}</span>
                                                </div>
                                                <div style={{ fontSize: "13px", color: "#4b5563" }}>{edu.school}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {certifications && certifications.length > 0 && (
                                    <div style={styles.printSection}>
                                        <h3 style={styles.printSecTitle}>Certifications</h3>
                                        <div style={styles.printSecDivider} />
                                        <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "13px", color: "#1f2937" }}>
                                            {certifications.map((cert, idx) => (
                                                <li key={idx} style={{ marginBottom: "4px" }}>{cert}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

const styles: { [key: string]: React.CSSProperties } = {
    centerContainer: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "400px",
        color: "var(--text)",
    },
    container: {
        textAlign: "left",
        padding: "24px",
        boxSizing: "border-box",
        width: "100%",
    },
    header: {
        borderBottom: "1px solid var(--border)",
        paddingBottom: "20px",
        marginBottom: "24px",
    },
    backBtn: {
        background: "none",
        border: "none",
        color: "var(--accent)",
        cursor: "pointer",
        padding: 0,
        fontSize: "15px",
        marginBottom: "12px",
        fontFamily: "var(--sans)",
        display: "block",
    },
    headerActions: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "16px",
    },
    buttonGroup: {
        display: "flex",
        gap: "10px",
    },
    formGroup: {
        display: "flex",
        flexDirection: "column",
        gap: "6px",
        marginBottom: "20px",
    },
    formGroupHalf: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        gap: "6px",
    },
    formGrid: {
        display: "flex",
        gap: "16px",
        marginBottom: "12px",
    },
    label: {
        fontSize: "15px",
        fontWeight: "bold",
        color: "var(--text-h)",
    },
    fieldLabel: {
        fontSize: "13px",
        fontWeight: 600,
        color: "var(--text)",
    },
    input: {
        padding: "10px 14px",
        border: "1px solid var(--border)",
        borderRadius: "6px",
        background: "var(--bg)",
        color: "var(--text-h)",
        fontSize: "15px",
        width: "100%",
        boxSizing: "border-box",
    },
    textarea: {
        padding: "10px 14px",
        border: "1px solid var(--border)",
        borderRadius: "6px",
        background: "var(--bg)",
        color: "var(--text-h)",
        fontSize: "15px",
        fontFamily: "var(--sans)",
        width: "100%",
        boxSizing: "border-box",
        resize: "vertical",
    },
    helpText: {
        fontSize: "12px",
        color: "var(--text)",
    },
    tabs: {
        display: "flex",
        borderBottom: "1px solid var(--border)",
        marginBottom: "20px",
        gap: "8px",
        overflowX: "auto",
        paddingBottom: "4px",
    },
    tabBtn: {
        padding: "10px 16px",
        background: "none",
        border: "none",
        color: "var(--text)",
        cursor: "pointer",
        fontSize: "14px",
        fontWeight: 500,
        borderBottom: "2px solid transparent",
        whiteSpace: "nowrap",
    },
    activeTabBtn: {
        color: "var(--accent)",
        borderBottom: "2px solid var(--accent)",
        fontWeight: "bold",
    },
    tabContentPanel: {
        background: "var(--bg)",
        border: "1px solid var(--border)",
        borderRadius: "8px",
        padding: "24px",
        boxShadow: "var(--shadow)",
    },
    tabPane: {
        display: "flex",
        flexDirection: "column",
        gap: "16px",
    },
    paneHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "8px",
    },
    paneTitle: {
        margin: 0,
        fontSize: "20px",
        fontWeight: 600,
        color: "var(--text-h)",
    },
    paneDesc: {
        margin: 0,
        fontSize: "14px",
        color: "var(--text)",
    },
    addBtn: {
        padding: "6px 12px",
        fontSize: "13px",
    },
    emptyText: {
        color: "var(--text)",
        fontStyle: "italic",
        textAlign: "center",
        padding: "20px 0",
    },
    list: {
        display: "flex",
        flexDirection: "column",
        gap: "20px",
    },
    itemCard: {
        border: "1px solid var(--border)",
        borderRadius: "6px",
        padding: "16px",
        background: "var(--code-bg)",
    },
    itemHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "12px",
        borderBottom: "1px dashed var(--border)",
        paddingBottom: "8px",
    },
    removeBtn: {
        background: "none",
        border: "none",
        color: "#ef4444",
        cursor: "pointer",
        fontSize: "13px",
        fontWeight: 600,
    },
    tagGrid: {
        display: "flex",
        flexWrap: "wrap",
        gap: "8px",
    },
    tagBadge: {
        background: "var(--accent-bg)",
        color: "var(--accent)",
        border: "1px solid var(--accent-border)",
        padding: "4px 10px",
        borderRadius: "20px",
        fontSize: "13px",
        fontWeight: 500,
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
    },
    tagCloseBtn: {
        background: "none",
        border: "none",
        color: "var(--accent)",
        cursor: "pointer",
        padding: 0,
        fontSize: "16px",
        lineHeight: 1,
    },
    aiPolishBtn: {
        background: "none",
        border: "1px solid var(--accent-border)",
        color: "var(--accent)",
        padding: "3px 8px",
        borderRadius: "4px",
        cursor: "pointer",
        fontSize: "12px",
        fontWeight: "bold",
    },
    previewActionsHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: "var(--code-bg)",
        border: "1px solid var(--border)",
        padding: "16px",
        borderRadius: "6px",
        marginBottom: "20px",
        gap: "16px",
        flexWrap: "wrap",
    },
    printBtn: {
        background: "var(--accent)",
        color: "#fff",
        border: "none",
        padding: "8px 16px",
        borderRadius: "4px",
        cursor: "pointer",
        fontWeight: "bold",
        fontSize: "14px",
    },
    printResumePaper: {
        background: "#fff",
        color: "#111827",
        border: "1px solid #d1d5db",
        borderRadius: "6px",
        padding: "40px",
        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
        maxWidth: "800px",
        margin: "0 auto",
        fontFamily: "'Inter', sans-serif",
    },
    printHeader: {
        textAlign: "center",
        marginBottom: "30px",
    },
    printName: {
        fontSize: "28px",
        fontWeight: "bold",
        color: "#111827",
        margin: "0 0 6px 0",
        letterSpacing: "-0.5px",
    },
    printSub: {
        fontSize: "14px",
        color: "#4b5563",
        margin: 0,
        textTransform: "uppercase",
        letterSpacing: "1px",
        fontWeight: 500,
    },
    printSection: {
        marginBottom: "24px",
    },
    printSecTitle: {
        fontSize: "16px",
        fontWeight: "bold",
        color: "#111827",
        margin: "0 0 6px 0",
        textTransform: "uppercase",
        letterSpacing: "0.5px",
    },
    printSecDivider: {
        height: "2px",
        background: "#e5e7eb",
        marginBottom: "12px",
    },
    printSummaryBody: {
        fontSize: "13.5px",
        color: "#1f2937",
        lineHeight: "1.5",
        margin: 0,
        whiteSpace: "pre-wrap",
    },
    printItem: {
        marginBottom: "16px",
    },
    printItemHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
    },
    printItemTitle: {
        fontSize: "14.5px",
        color: "#111827",
    },
    printItemMeta: {
        fontSize: "12.5px",
        color: "#4b5563",
    },
    printItemSubHeader: {
        marginBottom: "6px",
    },
    printItemCompany: {
        fontSize: "13.5px",
        color: "#1f2937",
        fontWeight: 600,
    },
    printItemDesc: {
        fontSize: "13px",
        color: "#374151",
        lineHeight: "1.45",
        margin: 0,
        whiteSpace: "pre-wrap",
        paddingLeft: "10px",
        borderLeft: "2px solid #f3f4f6",
    },
    printItemTech: {
        fontSize: "12.5px",
        color: "#4b5563",
        fontStyle: "italic",
    },
    printItemLinksRow: {
        display: "flex",
        alignItems: "center",
        fontSize: "12.5px",
        margin: "2px 0 6px 0",
    },
    printLink: {
        color: "#2563eb",
        textDecoration: "none",
        fontWeight: 500,
    },
    printSkillsList: {
        fontSize: "13.5px",
        color: "#1f2937",
        lineHeight: "1.5",
        margin: 0,
    },
};
