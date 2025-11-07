-- Supabase SQL Schema for Projects Table
-- Run this SQL in your Supabase SQL Editor to create the projects table

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    image TEXT,
    tech TEXT[] NOT NULL DEFAULT '{}',
    github_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_projects_display_order ON projects(display_order);
CREATE INDEX IF NOT EXISTS idx_projects_is_active ON projects(is_active);

-- Enable Row Level Security (RLS)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access
CREATE POLICY "Allow public read access" ON projects
    FOR SELECT
    USING (is_active = true);

-- Insert sample project data (at least 4 real full samples based on existing data)
INSERT INTO projects (title, description, image, tech, github_url, display_order) VALUES
(
    'Arabic PDF Chat 📚💬',
    'Arabic Chat with PDF is an innovative tool designed to enable users to interactively query Arabic PDF documents. Powered by state-of-the-art language models and document processing libraries, this application extracts, processes, and retrieves meaningful insights from Arabic text documents.',
    'https://placehold.co/600x400/D92323/121212?text=Arabic+PDF+Chat',
    ARRAY['Gradio', 'PyPDF2', 'LangChain', 'gTTS', 'Gemma2', 'pytesseract', 'sentence-transformers'],
    'https://github.com/MohammedNasserAhmed/arabic-pdf-chat',
    1
),
(
    'aiNarabic Hub',
    'Our aiNarabic Hub is the official web presence for the aiNarabic initiative. It''s designed to be a central hub for the Arabic-speaking community to explore the world of Artificial Intelligence. The platform is built from the ground up using a modern, performant, and scalable tech stack. open-source.',
    'https://placehold.co/600x400/333333/FFFFFF?text=aiNarabic+Hub',
    ARRAY['React', 'Tailwind', 'Vite', 'Vercel', 'TypeScript', 'Next.js'],
    'https://github.com/MohammedNasserAhmed/ainarabic-hub',
    2
),
(
    'ATS Cover Letter Generator',
    'The ATS Cover Letter Generator bridges the gap between job seekers and employers by leveraging AI to create perfectly tailored, Applicant Tracking System (ATS) optimized cover letters. Using Groq''s high-performance LLaMA-3.1-8B-Instant API, the application analyzes your resume and job descriptions to craft compelling cover letters that increase your chances of interview selection.',
    'https://placehold.co/600x400/D92323/121212?text=ATS+Cover+Letter+Generator',
    ARRAY['Streamlit', 'Docker', 'RAG', 'Llama', 'Groq', 'Python'],
    'https://github.com/MohammedNasserAhmed/ats-cover-letter-generator.git',
    3
),
(
    'Arabic Digits Recognition',
    'Arabic Digits Recognition project aims to develop a robust Convolutional Neural Network (CNN) model capable of accurately recognizing spoken Arabic digits. This project leverages a diverse dataset collected from 65 individuals of varying ages and genders, ensuring a comprehensive representation of the Arabic-speaking population.',
    'https://placehold.co/600x400/333333/FFFFFF?text=Arabic+Digits+Recognition',
    ARRAY['Python', 'Librosa', 'Pandas', 'Tensorflow', 'Keras', 'Numpy', 'Matplotlib', 'CNN', 'ETL'],
    'https://github.com/MohammedNasserAhmed/arabic-digits-recognition',
    4
),
(
    'CodeXpert',
    'CodeXpert, an advanced, state-of-the-art framework designed to analyze, explain, and optimize Python codebases. This repository leverages CodeLlama, LangChain, and FAISS to deliver a seamless, interactive experience for code comprehension and improvement.',
    'https://placehold.co/600x400/D92323/121212?text=CodeXpert',
    ARRAY['Python', 'CodeLlama', 'LangChain', 'FAISS', 'HuggingFace'],
    'https://github.com/MohammedNasserAhmed/CodeXpert',
    5
),
(
    'AI-Powered Resume Analyzer',
    'An intelligent system that uses natural language processing and machine learning to analyze resumes, extract key information, and provide actionable insights for both job seekers and recruiters. Features include skill gap analysis, ATS compatibility scoring, and personalized improvement suggestions.',
    'https://placehold.co/600x400/333333/FFFFFF?text=Resume+Analyzer',
    ARRAY['Python', 'spaCy', 'FastAPI', 'React', 'Docker', 'PostgreSQL'],
    'https://github.com/MohammedNasserAhmed/resume-analyzer',
    6
);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at on row update
CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Verify the data was inserted
SELECT id, title, array_length(tech, 1) as tech_count, created_at 
FROM projects 
ORDER BY display_order;
