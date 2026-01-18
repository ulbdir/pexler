<script lang="ts">
    import { _ } from "svelte-i18n";

    let { message = "", type = "success" }: { message?: string; type?: "success" | "error" } = $props();

    let isVisible: boolean = $state(true);

    // Auto-hide after 3 seconds
    $effect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                isVisible = false;
            }, 3000);
            return () => clearTimeout(timer);
        }
    });

    function getToastClasses(): string {
        const baseClasses = "toast toast-bottom toast-end z-50 transition-all duration-300 rounded-lg shadow-lg border-2";
        const typeClasses = type === "success" 
            ? "bg-success text-success-content border-success" 
            : "bg-error text-error-content border-error";
        const visibilityClasses = isVisible 
            ? "opacity-100 translate-y-0" 
            : "opacity-0 translate-y-2 pointer-events-none";
        
        return `${baseClasses} ${typeClasses} ${visibilityClasses}`;
    }
</script>

{#if isVisible}
    <div class={getToastClasses()}>
        <div class="flex items-center gap-3 px-4 py-3">
            {#if type === "success"}
                <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            {:else}
                <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            {/if}
            <span class="font-medium">{message}</span>
        </div>
    </div>
{/if}

<style>
    .toast {
        position: fixed;
        bottom: 1rem;
        right: 1rem;
        z-index: 9999;
    }
</style>