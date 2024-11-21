import type { rosanaComponent } from "./types.js";
import { optionsApi } from "./layouts.js";
import { cssParser } from "./parser.js";
import { debugInfo } from "./helpers.js";

const eventHandlersMap = new Map<string, Function>();

document.body.addEventListener("click", (event) => {
    const target = event.target as HTMLElement;
    if (target?.id && eventHandlersMap.has(target.id)) {
        eventHandlersMap.get(target.id)?.();
    }
});

// Component Controller Class Implementation
export class rosanaComponentProperties implements rosanaComponent {
    ismounted: Boolean;
    element: HTMLElement;
    elementClasses: string[];

    constructor() {
        this.element = document.createElement("div");
        // Default to a `div` element
        this.elementClasses = [];
        this.ismounted = true;
    }

    /**
     * Add a child component to this component.
     */
    addChild(child: rosanaComponent): this {
        if (!child?.element) {
            console.warn(`The passed object is not a valid Rosana/HTML element.`, child);
            return this;
        }
        this.element.appendChild(child.element);
        return this;
    }

    /**
     * Callback invoked when the component is added to the DOM.
     */
    set onMount(Fn: Function) {
        if (this.element && typeof Fn === "function") {
            Fn();
        }
    }

    /**
     * Callback invoked when the component is removed from the DOM.
     */
    set onUnMount(Fn: Function) {
        if (!this.ismounted) {
            Fn();
        }
    }

    /**
     * Set the alignment of child elements in this component.
     */
    alignment(options: string): this {
        if (!options) {
            console.warn(`Alignment options are undefined for:`, this.element);
        }
        optionsApi(this.element, options);
        return this;
    }

    /**
     * Batch DOM API property setters for this component.
     */
    batch(props: Record<string, unknown>): this {
        if (!props) {
            throw new Error(`Null batched props for: ${this}`);
        }

        Object.entries(props).forEach(([key, value]) => {
            requestAnimationFrame(() => {
                (this.element as any)[key] = value;
            });
        });

        return this;
    }

    /**
     * Add an onclick event listener to this component.
     */
    set ontouch(handler: Function) {
        if (typeof handler !== "function") {
            throw new Error(`The onclick setter expects a function, but received: ${typeof handler}`);
        }
        eventHandlersMap.set(this.element.id, handler);
    }

    /**
     * Add CSS scoped styles to this component.
     */
    css(styles: TemplateStringsArray | Record<string, string>): this {
        const className = cssParser(styles);
        this.element.classList.add(className);
        this.elementClasses.push(className);
        return this;
    }

    /**
     * Remove a child component from this component.
     */
    destroyChild(child: rosanaComponent): this {
        if (!child?.element) {
            debugInfo(
                "The passed child is null/undefined or not a valid Rosana component.",
                "destroyChild Function",
                child
            );
            return this;
        }

        eventHandlersMap.delete(child.element.id);
        child.element.remove();
        return this;
    }

    /**
     * Remove All Children In That Layout
     */
    clear(): this {
        this.element.innerHTML = "";
        return this;
    }

    /**
     * Make this component visible.
     */
    show(): this {
        this.element.classList.remove("hide", "gone");
        this.element.classList.add("show");
        return this;
    }

    /**
     * Hide this component.
     */
    hide(): this {
        this.element.classList.remove("show");
        this.element.classList.add("hide");
        return this;
    }

    /**
     * Remove this component from the visual flow and hide it.
     */
    gone(): this {
        this.element.classList.remove("show", "hide");
        this.element.classList.add("gone");
        return this;
    }
}