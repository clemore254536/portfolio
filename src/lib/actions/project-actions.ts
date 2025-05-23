"use server";

import db from '@/db/drizzle';
import { projects } from '@/db/schema';
import { eq, and, ne } from 'drizzle-orm';
import { Project, ProjectCategory } from '@/types/project';
import { v4 as uuidv4 } from 'uuid';
import { revalidatePath } from 'next/cache';

// Helper to map DB row to Project type
function mapRowToProject(row: typeof projects.$inferSelect): Project {
  return {
    ...row,
    category: row.category as ProjectCategory,
    createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt,
    challenge: row.challenge ?? undefined,
    solution: row.solution ?? undefined,
    // Ensure JSON fields are parsed if they come back as strings (though Drizzle usually handles this)
    tags: typeof row.tags === 'string' ? JSON.parse(row.tags) : row.tags,
    thumbnail: typeof row.thumbnail === 'string' ? JSON.parse(row.thumbnail) : row.thumbnail,
    images: typeof row.images === 'string' ? JSON.parse(row.images) : row.images,
  };
}

// Helper to revalidate all project-related pages
export async function revalidateProjectPages() {
  revalidatePath('/projects');
  revalidatePath('/projects/[slug]');
  revalidatePath('/');
  revalidatePath('/admin');
}

// Get all projects
export async function getProjects(): Promise<Project[]> {
  const rows = await db.select().from(projects);
  return rows.map(mapRowToProject);
}

// Get a single project by ID
export async function getProjectById(id: string): Promise<Project | undefined> {
  const [row] = await db.select().from(projects).where(eq(projects.id, id));
  return row ? mapRowToProject(row) : undefined;
}

// Create a new project
export async function createProject(data: Omit<Project, 'id' | 'createdAt'>): Promise<Project> {
  const id = uuidv4();
  const createdAt = new Date(); // Use Date object
  const [row] = await db
    .insert(projects)
    .values({ ...data, id, createdAt })
    .returning();
    
  // Revalidate project pages
  await revalidateProjectPages();
  
  return mapRowToProject(row);
}

// Update an existing project
export async function updateProject(id: string, data: Partial<Omit<Project, 'id' | 'createdAt'>>): Promise<Project | undefined> {
  const [row] = await db
    .update(projects)
    .set({ ...data })
    .where(eq(projects.id, id))
    .returning();
    
  // Revalidate project pages
  await revalidateProjectPages();
  
  return row ? mapRowToProject(row) : undefined;
}

// Delete a project
export async function deleteProject(id: string): Promise<void> {
  await db.delete(projects).where(eq(projects.id, id));
  
  // Revalidate project pages
  await revalidateProjectPages();
}

// Get a project by slug
export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const [row] = await db.select().from(projects).where(eq(projects.slug, slug));
  return row ? mapRowToProject(row) : null;
}

// Get related projects based on category and exclude current project
export async function getRelatedProjects(currentSlug: string, limit = 3): Promise<Project[]> {
  const currentProject = await getProjectBySlug(currentSlug);
  
  if (!currentProject) return [];
  
  // First try to find projects with the same category
  const rows = await db.select()
    .from(projects)
    .where(
      and(
        eq(projects.category, currentProject.category),
        ne(projects.slug, currentSlug)
      )
    )
    .limit(limit);
  
  let relatedProjects = rows.map(mapRowToProject);
  
  // If not enough related projects by category, add some other projects
  if (relatedProjects.length < limit) {
    const remainingLimit = limit - relatedProjects.length;
    const otherRows = await db.select()
      .from(projects)
      .where(
        and(
          ne(projects.category, currentProject.category),
          ne(projects.slug, currentSlug)
        )
      )
      .limit(remainingLimit);
    
    relatedProjects = [...relatedProjects, ...otherRows.map(mapRowToProject)];
  }
  
  return relatedProjects;
}

// Get featured projects
export async function getFeaturedProjects(limit = 3): Promise<Project[]> {
  const rows = await db.select()
    .from(projects)
    .where(eq(projects.featured, true))
    .limit(limit);
  
  return rows.map(mapRowToProject);
} 