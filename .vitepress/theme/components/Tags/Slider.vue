<template>
  <input
    v-model.number="sliderValue"
    type="range"
    :min="min"
    :max="max"
    :step="interval"
    class="slider"
    @input="handleChange(sliderValue)"
  />
</template>

<script setup>
const props = defineProps({
  value: {
    type: Number,
    default: 0.7,
  },
  min: {
    type: Number,
    default: 0,
  },
  max: {
    type: Number,
    default: 1,
  },
  interval: {
    type: Number,
    default: 0.01,
  },
});

const sliderValue = ref(props.value);
const emits = defineEmits(["update"]);

const handleChange = (newValue) => {
  emits("update", Number(newValue));
};

watch(
  () => props.value,
  (value) => {
    sliderValue.value = value;
  },
);
</script>

<style lang="scss" scoped>
.slider {
  appearance: none;
  width: 100%;
  height: 8px;
  margin: 0;
  padding: 0;
  border: 0;
  border-radius: 25px;
  outline: none;
  background: var(--main-color-bg);
  cursor: pointer;

  &::-webkit-slider-thumb {
    appearance: none;
    width: 16px;
    height: 16px;
    border: 1px solid var(--main-color-bg);
    border-radius: 50%;
    background: var(--main-color);
    box-shadow: 0.5px 0.5px 2px 1px rgba(0, 0, 0, 0.32);
  }

  &::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border: 1px solid var(--main-color-bg);
    border-radius: 50%;
    background: var(--main-color);
    box-shadow: 0.5px 0.5px 2px 1px rgba(0, 0, 0, 0.32);
  }
}
</style>
