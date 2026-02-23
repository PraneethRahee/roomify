import { useNavigate, useOutletContext } from "react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Box, Clock, History, Layout, Sparkles } from "lucide-react";
import Navbar from "../components/Navbar";
import Upload from "../components/Upload";
import { createProject, getProjects } from "../../lib/puter.action";

const Home = () => {
    const navigate = useNavigate();
    const { isSignedIn, userId } = useOutletContext<AuthContext>();
    const [projects, setProjects] = useState<DesignItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const isCreatingProjectRef = useRef(false);

    useEffect(() => {
        const fetchProjects = async () => {
            setIsLoading(true);
            const items = await getProjects();
            setProjects(items);
            setIsLoading(false);
        };
        fetchProjects();
    }, [isSignedIn]);

    const handleUploadComplete = async (base64Data: string) => {
        if (isCreatingProjectRef.current) return false;
        isCreatingProjectRef.current = true;

        const projectId = Math.random().toString(36).slice(2, 11);
        const newItem: DesignItem = {
            id: projectId,
            name: `Residence ${projectId}`,
            sourceImage: base64Data,
            timestamp: Date.now(),
            ownerId: userId,
            isPublic: false,
        };

        const saved = await createProject({ item: newItem, visibility: "private" });
        isCreatingProjectRef.current = false;

        if (saved) {
            navigate(`/visualizer/${saved.id}`);
        } else {
            navigate(`/visualizer/${projectId}`);
        }
    };

    return (
        <div className="home">
            <Navbar />

            <section className="hero">
                <div className="inner">
                    <div className="content">
                        <div className="badge">
                            <Sparkles className="icon" />
                            <span>AI-Powered Architecture</span>
                        </div>
                        <h1>Turn Floor Plans into <span>3D Reality</span></h1>
                        <p>Upload your 2D floor plan and let our AI transform it into a photorealistic 3D visualization in seconds.</p>

                        <div className="actions">
                            <a href="#upload" className="btn btn--primary btn--lg">Get Started</a>
                            <a href="#" className="btn btn--ghost btn--lg">How it works</a>
                        </div>
                    </div>
                </div>
            </section>

            <section id="upload" className="upload-shell">
                <div className="section-inner">
                    <div className="upload-card">
                        <div className="upload-head">
                            <div className="upload-icon">
                                <Layout />
                            </div>
                            <h2>Start Your Design</h2>
                            <p>Upload a clear JPG or PNG of your 2D floor plan</p>
                        </div>
                        <Upload onComplete={handleUploadComplete} />
                    </div>
                </div>
            </section>

            <section className="projects">
                <div className="section-inner">
                    <div className="section-head">
                        <div className="copy">
                            <h2>Your Projects</h2>
                            <p>Recent floor plan transformations</p>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="loading">
                            <History className="animate-spin mr-2" /> Loading your history...
                        </div>
                    ) : projects.length > 0 ? (
                        <div className="projects-grid">
                            {projects.map((project) => (
                                <div
                                    key={project.id}
                                    className="project-card group"
                                    onClick={() => navigate(`/visualizer/${project.id}`)}
                                >
                                    <div className="preview">
                                        <img src={project.renderedImage || project.sourceImage} alt={project.name || "Project"} />
                                        <div className="badge">
                                            <span>{project.renderedImage ? "Rendered" : "Original"}</span>
                                        </div>
                                    </div>
                                    <div className="card-body">
                                        <div>
                                            <h3>{project.name || "Untitled Project"}</h3>
                                            <div className="meta">
                                                <Clock className="w-3 h-3" />
                                                <span>{new Date(project.timestamp).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        <div className="arrow">
                                            <ArrowRight className="w-5 h-5" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty">
                            <Box className="w-12 h-12 mx-auto mb-4 opacity-20" />
                            <p>No projects yet. Upload your first floor plan to get started!</p>
                        </div>
                    )}
                </div>
            </section>

            <section className="partners">
                <div className="section-inner">
                    <div className="logos">
                        <div className="logo-item">
                            <Box /> <span>ARCH-VIZ</span>
                        </div>
                        <div className="logo-item">
                            <Box /> <span>STRUCT</span>
                        </div>
                        <div className="logo-item">
                            <Box /> <span>MODERN</span>
                        </div>
                        <div className="logo-item">
                            <Box /> <span>DESIGN</span>
                        </div>
                        <div className="logo-item">
                            <Box /> <span>PLAN-X</span>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;