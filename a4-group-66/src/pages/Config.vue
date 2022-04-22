<template>
    <main class="config-main">
        <section class="configurator">
            <!-- preview only shown if there is an artwork -->
            <div class="preview" v-if="artwork">
                <!-- Custom-Object with some Attributes -->
                <framed-artwork :artwork="artwork" :config="config" @print-sizes="printSizes = $event"/>
                <museum-label :artwork="artwork"/>
            </div>

            <!-- No reloading of the page -->
            <form class="museum-label" id="config-form" @submit.prevent>
                <!-- PrintSize -->
                <print-size-picker v-model="config.printSize" :printSizes="printSizes"/>
                <!-- FrameWidth -->
                <WidthSlider v-model="config.frameWidth" v-bind:label="'Frame'" v-bind:min="20" v-bind:max="50" :frameWidth="frameWidth"/>
                <!-- FrameStylePicker -->
                <FrameStylePicker v-model="config.frameStyle" :frameStyle="frameStyle"/>
                <!-- MatWidth -->
                <WidthSlider v-model="config.matWidth" v-bind:label="'Mat'" v-bind:min="0" v-bind:max="100" :matwidth="matWidth"/>
                <!-- MatColor -->
                <MatColorPicker v-model="config.matColor" :matColor="matColor"/>
                <fieldset>
                    <legend>Price</legend>
                    <div class="config-row">
                        <label for="price">Price (excl. shipping)</label>
                        <div>
                            <span class="price" id="price">€ {{price}}</span>
                        </div>
                    </div>
                    <div class="config-row">
                        <label for="total-size">Total Size (incl. frame and mat)</label>
                        <div id="total-size">{{totalSizeText}} cm</div>
                    </div>
                    <button type="button" v-on:click="update" class="buy">Add to Cart</button>
                </fieldset>
            </form>
        </section>
    </main>
</template>

<script>
    import * as ArtmartService from "@/services/ArtmartService";
    import FramedArtwork from "@/components/FramedArtwork";
    import MuseumLabel from "@/components/MuseumLabel";
    import PrintSizePicker from "@/components/config/PrintSizePicker";
    import WidthSlider from "../components/config/WidthSlider";
    import FrameStylePicker from "../components/config/FrameStylePicker";
    import MatColorPicker from "../components/config/MatColorPicker";

    export default {
        name: "Config",
        components: {
            MatColorPicker,
            FrameStylePicker,
            WidthSlider,
            FramedArtwork,
            MuseumLabel,
            PrintSizePicker
        },
        props: {
            artworkId: Number,
            min: Number
        },
        data: function () {
            return {
                artwork: null,
                printSizes: {S: [0, 0], M: [0, 0], L: [0, 0]},
                config: {
                    printSize: "M",
                    frameWidth: 40,
                    frameStyle: this.$store.getters.sortedFrames[0].style,
                    matWidth: 55,
                    matColor: this.$store.getters.sortedMats[0].color
                }
            };
        },
        /* Computed Property's with more logic */
        computed: {
            frame() {
                return this.$store.state.frames.get(this.config.frameStyle);
            },
            price() {
                const cF = (this.config.frameWidth / 10) * this.frame.cost;
                const cM = (this.config.matWidth / 10) * 5;
                const s = {S: 1, M: 2, L: 3.5}[this.config.printSize];
                return ((3000 + cF + cM) * s / 100).toFixed(2);
            },
            totalSize() {
                const [w, h] = this.printSizes[this.config.printSize];
                const x = 2 * this.config.frameWidth + 2 * this.config.matWidth;
                return [w + x, h + x];
            },
            totalSizeText() {
                const [w, h] = this.totalSize;
                return (w / 10).toFixed(1) + " × " + (h / 10).toFixed(1);
            }
        },
        mounted() {
            ArtmartService.getArtwork(this.artworkId).then(artwork => {
                if (artwork == null) {
                    this.$router.replace({path: "/search"});
                }
                this.artwork = artwork;
            });

            const clamp = (x, min, max) => Math.trunc(Math.min(Math.max(x, min), max));

            const query = this.$route.query;
            if (["S", "M", "L"].includes(query.printSize)) {
                this.config.printSize = query.printSize;
            }
            if (isFinite(+query.frameWidth)) {
                this.config.frameWidth = clamp(+query.frameWidth, 20, 50);
            }
            const frameStyles = this.$store.getters.sortedFrames.map(x => x.style);
            if (frameStyles.includes(query.frameStyle)) {
                this.config.frameStyle = query.frameStyle;
            }
            if (isFinite(+query.matWidth)) {
                this.config.matWidth = clamp(+query.matWidth, 0, 100);
            }
            const matColors = this.$store.getters.sortedMats.map(x => x.color);
            if (matColors.includes(query.matColor)) {
                this.config.matColor = query.matColor;
            }
        },
        watch: {
            config: {
                deep: true,
                handler() {
                    const q = this.$route.query;
                    const c = this.config;
                    if (
                        q.frameWidth != c.frameWidth ||
                        q.matWidth != c.matWidth ||
                        q.frameStyle != c.frameStyle ||
                        q.matColor != c.matColor ||
                        q.printSize != c.printSize
                    ) {
                        this.$router.replace({query: this.config});
                    }
                }
            }
        },
        methods: {
            update: function () {
                this.$store.dispatch("addToCart",
                    {"artworkId": this.artworkId, "frameStyle": this.config.frameStyle,
                        "frameWidth": this.config.frameWidth, "matColor": this.config.matColor,
                        "matWidth": this.config.matWidth, "printSize": this.config.printSize})

                this.$router.push("/cart");
            }
        }
    };
</script>

<style>
    .configurator fieldset {
        border: none;
        min-width: auto;
        border-bottom: 1px solid #eff2f5;
        padding: 15px 20px 15px 20px;
        margin: 0;
    }

    .configurator fieldset:last-of-type {
        border-bottom: none;
        display: flex;
        flex-direction: column;
    }

    /* legend is necessary for accessibility, but we don't want to show it */
    .configurator fieldset legend {
        position: absolute;
        clip: rect(0 0 0 0);
    }
</style>

<style scoped>
    .preview {
        display: flex;
        flex-direction: column;
        align-items: center;
        max-width: 500px;
        max-height: 500px;
        min-width: 250px;
        flex: 1 1 250px;
        margin: 2rem 50px;
    }

    .preview img {
        box-shadow: 0px 30px 60px 0px rgba(0, 0, 0, 0.5);
    }

    .preview .museum-label {
        font-size: 0.9rem;
        margin-top: 2rem;
        padding: 1em;
    }

    .configurator {
        display: flex;
        flex-direction: row;
        align-items: center;
        flex-wrap: wrap;
        justify-content: center;
        margin-bottom: 4rem;
    }

    .configurator form {
        width: 400px;
    }

    @media (max-width: 600px) {
        .config-main {
            margin: 0;
        }

        .preview {
            width: 90%;
            flex: 0 0 auto;
            margin-left: 0;
            margin-right: 0;
        }

        .configurator {
            flex-direction: column;
            width: 100%;
            margin: 0;
        }

        .configurator form {
            width: 100%;
            box-shadow: none;
        }
    }

    .config-row {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
    }

    .price {
        font-weight: bold;
        font-size: 1.5rem;
    }

    .buy {
        margin-top: 1rem;
        width: 100%;
    }
</style>