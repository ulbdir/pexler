<script lang="ts">
    let {
        value,
        label,
        onCommit,
        type = "text",
        className = "",
        ...rest
    } = $props<{
        value: string;
        label: string;
        onCommit: (val: string) => void;
        type: string;
        className: string;
        [rest: string]: unknown;
    }>();

    let local = $state(value);
    let isTyping = $state(false);

    function handleKeydown(e: KeyboardEvent) {
        if (e.key === "Enter") {
            commit();
        }
    }

    function commit() {
        isTyping = false;
        if (local !== value) {
            onCommit(local);
        }
    }

    $effect(() => {
        if (!isTyping && value !== local) {
            local = value;
        }
    });
</script>

<div class="form-control flex-1">
    <label class="label" for="input">
        <span class="label-text">{label}</span>
    </label>
    <input
        id="input"
        value={local}
        class={className}
        {type}
        oninput={(e) => {
            isTyping = true;
            local = (e.target as HTMLInputElement).value;
        }}
        onblur={() => {
            commit();
        }}
        onkeydown={handleKeydown}
        {...rest}
    />
</div>
