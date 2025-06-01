<script>
    import { locale, waitLocale } from "svelte-i18n";
    import { locales } from "./lib/i18n/i18n.js";
    import { onDestroy } from "svelte";

    var currentLocale = $state();

    const unsubscribe = locale.subscribe((value) => {
        currentLocale = value;
    });

    function changeLocale(code) {
        locale.set(code);
        document.getElementById("language-dropdown").removeAttribute("open");
        waitLocale();
    }

    onDestroy(() => {
        unsubscribe();
    });
</script>

<main>
    {#if currentLocale}
        <details id="language-dropdown" class="dropdown dropdown-end">
            <summary class="btn btn-square m-1">🌐</summary>
            <ul
                class="menu dropdown-content bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm"
            >
                {#each locales as l}
                    <li>
                        <button
                            class={currentLocale?.startsWith(l.code)
                                ? "active font-bold"
                                : ""}
                            onclick={() => changeLocale(l.code)}
                        >
                            {l.label}
                            </button>
                    </li>
                {/each}
            </ul>
        </details>
    {/if}
</main>
