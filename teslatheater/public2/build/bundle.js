
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35730/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.35.0' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/App.svelte generated by Svelte v3.35.0 */

    const file = "src/App.svelte";

    function create_fragment(ctx) {
    	let main;
    	let p0;
    	let a0;
    	let img0;
    	let img0_src_value;
    	let t0;
    	let p1;
    	let a1;
    	let img1;
    	let img1_src_value;
    	let t1;
    	let a2;
    	let img2;
    	let img2_src_value;
    	let t2;
    	let a3;
    	let img3;
    	let img3_src_value;
    	let t3;
    	let a4;
    	let img4;
    	let img4_src_value;
    	let t4;
    	let a5;
    	let img5;
    	let img5_src_value;
    	let t5;
    	let a6;
    	let img6;
    	let img6_src_value;
    	let t6;
    	let a7;
    	let img7;
    	let img7_src_value;
    	let t7;
    	let a8;
    	let img8;
    	let img8_src_value;
    	let t8;
    	let a9;
    	let img9;
    	let img9_src_value;
    	let t9;
    	let a10;
    	let img10;
    	let img10_src_value;
    	let t10;
    	let a11;
    	let img11;
    	let img11_src_value;
    	let t11;
    	let p2;
    	let t12;
    	let script;

    	const block = {
    		c: function create() {
    			main = element("main");
    			p0 = element("p");
    			a0 = element("a");
    			img0 = element("img");
    			t0 = space();
    			p1 = element("p");
    			a1 = element("a");
    			img1 = element("img");
    			t1 = space();
    			a2 = element("a");
    			img2 = element("img");
    			t2 = space();
    			a3 = element("a");
    			img3 = element("img");
    			t3 = space();
    			a4 = element("a");
    			img4 = element("img");
    			t4 = space();
    			a5 = element("a");
    			img5 = element("img");
    			t5 = space();
    			a6 = element("a");
    			img6 = element("img");
    			t6 = space();
    			a7 = element("a");
    			img7 = element("img");
    			t7 = space();
    			a8 = element("a");
    			img8 = element("img");
    			t8 = space();
    			a9 = element("a");
    			img9 = element("img");
    			t9 = space();
    			a10 = element("a");
    			img10 = element("img");
    			t10 = space();
    			a11 = element("a");
    			img11 = element("img");
    			t11 = space();
    			p2 = element("p");
    			t12 = space();
    			script = element("script");
    			script.textContent = "var w = window.innerWidth\n\t\t|| document.documentElement.clientWidth\n\t\t|| document.body.clientWidth;\n\n\t\tvar h = window.innerHeight\n\t\t|| document.documentElement.clientHeight\n\t\t|| document.body.clientHeight;\n\n\t\tdocument.getElementById(\"demo1\").innerHTML = \"Browser inner window width: \" + w + \", height: \" + h + \".\";\n\n\t\tif(w <= 1500) {\n\t\t\t\tdocument.getElementById( \"img1\" ).style.display = \"inline\"; \n\t\t}";
    			set_style(img0, "display", "none");
    			attr_dev(img0, "id", "img1");
    			if (img0.src !== (img0_src_value = "logos/fullscreen.png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "GO FULL SCREEN");
    			attr_dev(img0, "class", "svelte-16wde2k");
    			add_location(img0, file, 6, 93, 143);
    			attr_dev(a0, "href", "https://www.youtube.com/redirect?q=https://bmaltais.github.io/");
    			attr_dev(a0, "class", "img-small svelte-16wde2k");
    			add_location(a0, file, 6, 2, 52);
    			add_location(p0, file, 5, 1, 46);
    			if (img1.src !== (img1_src_value = "logos/crave.png")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "Crave");
    			attr_dev(img1, "align", "middle");
    			attr_dev(img1, "hspace", "20");
    			attr_dev(img1, "vspace", "10");
    			attr_dev(img1, "class", "svelte-16wde2k");
    			add_location(img1, file, 9, 36, 342);
    			attr_dev(a1, "href", "https://www.crave.ca/en");
    			add_location(a1, file, 9, 2, 308);
    			if (img2.src !== (img2_src_value = "logos/disney.svg")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "Disney+");
    			attr_dev(img2, "align", "middle");
    			attr_dev(img2, "hspace", "20");
    			attr_dev(img2, "vspace", "10");
    			attr_dev(img2, "class", "svelte-16wde2k");
    			add_location(img2, file, 10, 51, 474);
    			attr_dev(a2, "href", "https://www.disneyplus.com/fr-ca/login");
    			add_location(a2, file, 10, 2, 425);
    			if (img3.src !== (img3_src_value = "logos/hbogo.gif")) attr_dev(img3, "src", img3_src_value);
    			attr_dev(img3, "alt", "HBO");
    			attr_dev(img3, "align", "middle");
    			attr_dev(img3, "hspace", "20");
    			attr_dev(img3, "vspace", "10");
    			attr_dev(img3, "class", "svelte-16wde2k");
    			add_location(img3, file, 11, 40, 598);
    			attr_dev(a3, "href", "https://www.crave.ca/en/hbo");
    			add_location(a3, file, 11, 2, 560);
    			if (img4.src !== (img4_src_value = "logos/bell.png")) attr_dev(img4, "src", img4_src_value);
    			attr_dev(img4, "alt", "Bell Fibe TV");
    			attr_dev(img4, "align", "middle");
    			attr_dev(img4, "hspace", "20");
    			attr_dev(img4, "vspace", "10");
    			attr_dev(img4, "class", "svelte-16wde2k");
    			add_location(img4, file, 12, 32, 709);
    			attr_dev(a4, "href", "https://tv.bell.ca/");
    			add_location(a4, file, 12, 2, 679);
    			if (img5.src !== (img5_src_value = "logos/netflix.png")) attr_dev(img5, "src", img5_src_value);
    			attr_dev(img5, "alt", "Tubi TV");
    			attr_dev(img5, "align", "middle");
    			attr_dev(img5, "hspace", "20");
    			attr_dev(img5, "vspace", "10");
    			attr_dev(img5, "class", "svelte-16wde2k");
    			add_location(img5, file, 13, 33, 829);
    			attr_dev(a5, "href", "https://netflix.com/");
    			add_location(a5, file, 13, 2, 798);
    			if (img6.src !== (img6_src_value = "logos/paramountplus.png")) attr_dev(img6, "src", img6_src_value);
    			attr_dev(img6, "alt", "Paramount+");
    			attr_dev(img6, "align", "middle");
    			attr_dev(img6, "hspace", "20");
    			attr_dev(img6, "vspace", "10");
    			attr_dev(img6, "class", "svelte-16wde2k");
    			add_location(img6, file, 14, 46, 960);
    			attr_dev(a6, "href", "https://www.paramountplus.com/ca/");
    			add_location(a6, file, 14, 2, 916);
    			if (img7.src !== (img7_src_value = "logos/toutv.png")) attr_dev(img7, "src", img7_src_value);
    			attr_dev(img7, "alt", "TouTV");
    			attr_dev(img7, "align", "middle");
    			attr_dev(img7, "hspace", "20");
    			attr_dev(img7, "vspace", "10");
    			attr_dev(img7, "class", "svelte-16wde2k");
    			add_location(img7, file, 15, 32, 1086);
    			attr_dev(a7, "href", "https://ici.tou.tv/");
    			add_location(a7, file, 15, 2, 1056);
    			if (img8.src !== (img8_src_value = "logos/tubitv.png")) attr_dev(img8, "src", img8_src_value);
    			attr_dev(img8, "alt", "Tubi TV");
    			attr_dev(img8, "align", "middle");
    			attr_dev(img8, "hspace", "20");
    			attr_dev(img8, "vspace", "10");
    			attr_dev(img8, "class", "svelte-16wde2k");
    			add_location(img8, file, 16, 32, 1199);
    			attr_dev(a8, "href", "https://tubitv.com/");
    			add_location(a8, file, 16, 2, 1169);
    			if (img9.src !== (img9_src_value = "logos/twitch.png")) attr_dev(img9, "src", img9_src_value);
    			attr_dev(img9, "alt", "Twitch");
    			attr_dev(img9, "align", "middle");
    			attr_dev(img9, "hspace", "20");
    			attr_dev(img9, "vspace", "10");
    			attr_dev(img9, "class", "svelte-16wde2k");
    			add_location(img9, file, 17, 35, 1318);
    			attr_dev(a9, "href", "https://www.twitch.com");
    			add_location(a9, file, 17, 2, 1285);
    			if (img10.src !== (img10_src_value = "logos/virginmobile.svg")) attr_dev(img10, "src", img10_src_value);
    			attr_dev(img10, "alt", "Twitch");
    			attr_dev(img10, "align", "middle");
    			attr_dev(img10, "hspace", "20");
    			attr_dev(img10, "vspace", "10");
    			attr_dev(img10, "class", "svelte-16wde2k");
    			add_location(img10, file, 18, 40, 1441);
    			attr_dev(a10, "href", "https://tv.virginmobile.ca/");
    			add_location(a10, file, 18, 2, 1403);
    			if (img11.src !== (img11_src_value = "logos/youtube.jpg")) attr_dev(img11, "src", img11_src_value);
    			attr_dev(img11, "alt", "Youtube");
    			attr_dev(img11, "align", "middle");
    			attr_dev(img11, "hspace", "20");
    			attr_dev(img11, "vspace", "10");
    			attr_dev(img11, "class", "svelte-16wde2k");
    			add_location(img11, file, 19, 36, 1566);
    			attr_dev(a11, "href", "https://www.youtube.com");
    			add_location(a11, file, 19, 2, 1532);
    			add_location(p1, file, 8, 1, 302);
    			attr_dev(p2, "id", "demo1");
    			add_location(p2, file, 21, 1, 1658);
    			add_location(script, file, 22, 1, 1678);
    			attr_dev(main, "class", "svelte-16wde2k");
    			add_location(main, file, 4, 0, 38);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, p0);
    			append_dev(p0, a0);
    			append_dev(a0, img0);
    			append_dev(main, t0);
    			append_dev(main, p1);
    			append_dev(p1, a1);
    			append_dev(a1, img1);
    			append_dev(p1, t1);
    			append_dev(p1, a2);
    			append_dev(a2, img2);
    			append_dev(p1, t2);
    			append_dev(p1, a3);
    			append_dev(a3, img3);
    			append_dev(p1, t3);
    			append_dev(p1, a4);
    			append_dev(a4, img4);
    			append_dev(p1, t4);
    			append_dev(p1, a5);
    			append_dev(a5, img5);
    			append_dev(p1, t5);
    			append_dev(p1, a6);
    			append_dev(a6, img6);
    			append_dev(p1, t6);
    			append_dev(p1, a7);
    			append_dev(a7, img7);
    			append_dev(p1, t7);
    			append_dev(p1, a8);
    			append_dev(a8, img8);
    			append_dev(p1, t8);
    			append_dev(p1, a9);
    			append_dev(a9, img9);
    			append_dev(p1, t9);
    			append_dev(p1, a10);
    			append_dev(a10, img10);
    			append_dev(p1, t10);
    			append_dev(p1, a11);
    			append_dev(a11, img11);
    			append_dev(main, t11);
    			append_dev(main, p2);
    			append_dev(main, t12);
    			append_dev(main, script);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	let { name } = $$props;
    	const writable_props = ["name"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    	};

    	$$self.$capture_state = () => ({ name });

    	$$self.$inject_state = $$props => {
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [name];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { name: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*name*/ ctx[0] === undefined && !("name" in props)) {
    			console.warn("<App> was created without expected prop 'name'");
    		}
    	}

    	get name() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'Tesla Theater'
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
