
export interface CandidateProfile {
    id: string;
    full_name: string;
    title: string | null;
    bio: string | null;
    image_url: string | null;
    phone: string | null;
    whatsapp: string | null;
    facebook: string | null;
    instagram: string | null;
    twitter: string | null;
    linkedin: string | null;
    updated_at: string;
}

export interface CandidateAchievement {
    id: string;
    title: string;
    description: string | null;
    year: string | null;
    order: number;
    created_at: string;
    updated_at: string;
}
