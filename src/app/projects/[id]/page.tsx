import type { Metadata } from 'next';
import { ProjectDetailsView } from '@/features/projects/components/ProjectDetailsView';

export const metadata: Metadata = { title: 'Project details' };

export default function ProjectDetailsPage({ params }: { params: { id: string } }) {
  return <ProjectDetailsView projectId={decodeURIComponent(params.id)} />;
}
