import { getPosts } from "@/utils/utils";
import { Column } from "@once-ui-system/core";
import { ProjectCard } from "@/components";
import { db } from "@/utils/db";

interface ProjectsProps {
  range?: [number, number?];
  exclude?: string[];
}

export async function Projects({ range, exclude }: ProjectsProps) {
  let allProjects: any[] = [];
  
  try {
    const dbProjects = await db.getProjects();
    allProjects = dbProjects.map((p) => ({
      slug: p.slug,
      content: p.content,
      metadata: {
        title: p.title,
        summary: p.summary,
        publishedAt: p.publishedAt,
        images: p.images || [],
        team: [],
        link: p.link || ""
      }
    }));
  } catch (err) {
    console.error("Failed to load projects from DB, using fallback MDX:", err);
    allProjects = getPosts(["src", "app", "work", "projects"]);
  }

  if (allProjects.length === 0) {
    allProjects = getPosts(["src", "app", "work", "projects"]);
  }

  // Exclude by slug (exact match)
  if (exclude && exclude.length > 0) {
    allProjects = allProjects.filter((post) => !exclude.includes(post.slug));
  }

  const sortedProjects = allProjects.sort((a, b) => {
    return new Date(b.metadata.publishedAt).getTime() - new Date(a.metadata.publishedAt).getTime();
  });

  const displayedProjects = range
    ? sortedProjects.slice(range[0] - 1, range[1] ?? sortedProjects.length)
    : sortedProjects;

  return (
    <Column fillWidth gap="xl" marginBottom="40" paddingX="l">
      {displayedProjects.map((post, index) => (
        <ProjectCard
          priority={index < 2}
          key={post.slug}
          href={`/work/${post.slug}`}
          images={post.metadata.images}
          title={post.metadata.title}
          description={post.metadata.summary}
          content={post.content}
          avatars={post.metadata.team?.map((member: any) => ({ src: member.avatar })) || []}
          link={post.metadata.link || ""}
        />
      ))}
    </Column>
  );
}
