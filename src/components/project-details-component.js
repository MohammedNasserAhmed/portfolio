export class ProjectDetailsComponent {
    constructor() {
        this.container = document.getElementById('project-content');
    }

    async init() {
        if (!this.container) return;

        const params = new URLSearchParams(window.location.search);
        const id = params.get('id');

        if (!id) {
            window.location.href = '/';
            return;
        }

        try {
            const response = await fetch(`/api/project-details?id=${id}`);
            if (!response.ok) throw new Error('Project not found');

            const project = await response.json();
            this.render(project);
        } catch (error) {
            console.error('Failed to load project:', error);
            this.container.innerHTML = `
                <div class="text-center py-12">
                    <h1 class="text-3xl font-bold text-white mb-4">Project Not Found</h1>
                    <a href="/" class="text-brand-red hover:underline">Return Home</a>
                </div>
            `;
        }
    }

    render(project) {
        const techStack = project.tech_stack
            ? project.tech_stack
                  .map(
                      (tech) =>
                          `<span class="px-3 py-1 bg-brand-dark rounded-full text-sm text-gray-300 border border-gray-800">${tech}</span>`
                  )
                  .join('')
            : '';

        this.container.innerHTML = `
            <div class="mb-8">
                <h1 class="text-4xl md:text-5xl font-bold text-white mb-6">${project.title}</h1>
                <div class="flex flex-wrap gap-3 mb-8">
                    ${techStack}
                </div>
                ${project.image_url ? `<img src="${project.image_url}" alt="${project.title}" class="w-full h-auto rounded-xl border border-glass-border mb-8">` : ''}
            </div>

            <div class="space-y-12">
                <section>
                    <h2 class="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                        <span class="w-1 h-8 bg-brand-red rounded-full"></span>
                        The Problem
                    </h2>
                    <p class="text-gray-300 text-lg leading-relaxed">${project.problem || project.description}</p>
                </section>

                <section>
                    <h2 class="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                        <span class="w-1 h-8 bg-blue-500 rounded-full"></span>
                        The Solution
                    </h2>
                    <p class="text-gray-300 text-lg leading-relaxed">${project.solution || 'Details coming soon.'}</p>
                </section>

                <section>
                    <h2 class="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                        <span class="w-1 h-8 bg-green-500 rounded-full"></span>
                        Impact
                    </h2>
                    <p class="text-gray-300 text-lg leading-relaxed">${project.impact || 'Details coming soon.'}</p>
                </section>

                <div class="flex gap-4 pt-8 border-t border-glass-border">
                    ${
                        project.github_url
                            ? `
                        <a href="${project.github_url}" target="_blank" class="flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                            View Code
                        </a>
                    `
                            : ''
                    }
                    ${
                        project.demo_url
                            ? `
                        <a href="${project.demo_url}" target="_blank" class="flex items-center gap-2 px-6 py-3 bg-brand-red hover:bg-red-700 text-white rounded-lg transition-colors font-medium">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                            Live Demo
                        </a>
                    `
                            : ''
                    }
                </div>
            </div>
        `;
    }
}
