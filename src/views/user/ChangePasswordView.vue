<script setup lang="ts">
import { ref } from 'vue';
// 假设这里引入修改密码的逻辑函数，暂时先空着
const oldPassword = ref('');
const newPassword = ref('');
const confirmNewPassword = ref('');

const handleSubmit = () => {
    // 这里添加密码修改的逻辑，例如调用后端接口
    if (newPassword.value!== confirmNewPassword.value) {
        console.error('新密码与确认密码不一致');
        return;
    }
    // 调用后端接口修改密码的逻辑待补充
};
</script>

<template>
  <div id="changePasswordView">
    <h1>修改密码</h1>
    <form @submit.prevent="handleSubmit">
      <label for="oldPassword">旧密码:</label>
      <input type="password" v-model="oldPassword" id="oldPassword" required>
      <label for="newPassword">新密码:</label>
      <input type="password" v-model="newPassword" id="newPassword" required>
      <label for="confirmNewPassword">确认新密码:</label>
      <input type="password" v-model="confirmNewPassword" id="confirmNewPassword" required>
      <button type="submit">提交</button>
    </form>
  </div>
</template>

<style scoped>
#changePasswordView {
  padding: 20px;
}
</style>

