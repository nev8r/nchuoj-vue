<script setup lang="ts">
import { useUserStore } from '@/stores/user'
import { Card, Typography, Form, Input, Avatar, Button, Message } from '@arco-design/web-vue'
import { ref, onMounted } from 'vue'
import { UserControllerService } from '@/api'

const userStore = useUserStore()
const FormItem = Form.Item
const TextArea = Input.TextArea

interface UserForm {
  userName?: string
  userProfile?: string
  userAvatar?: string
}

const formData = ref<UserForm>({
  userName: '',
  userProfile: '',
  userAvatar: ''
})
const loading = ref(false)
const editing = ref(false)
const userAccount = ref('')

// 获取用户信息
const fetchUserInfo = async () => {
  try {
    const res = await UserControllerService.getLoginUserUsingGet()
    if (res.data) {
      formData.value = {
        userName: res.data.userName,
        userProfile: res.data.userProfile,
        userAvatar: res.data.userAvatar
      }
      userAccount.value = res.data.userAccount || ''
    }
  } catch (error) {
    Message.error('获取用户信息失败')
  }
}

// 提交表单
const handleSubmit = async () => {
  try {
    loading.value = true
    await UserControllerService.updateMyUserUsingPost(formData.value)
    await fetchUserInfo() // 更新用户信息
    Message.success('信息更新成功')
    editing.value = false
  } catch (error) {
    Message.error('更新失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchUserInfo()
})
</script>

<template>
  <div id="userInfoView">
    <Card :bordered="false" class="user-info-card">
      <template #title>
        <Typography.Title :heading="5">用户信息</Typography.Title>
      </template>

      <Form :model="formData" layout="vertical">
        <div class="avatar-section">
          <Avatar :size="100" :image-url="formData.userAvatar" />
        </div>

        <!-- <FormItem label="账户" field="userAccount">
          <Input :model-value="userAccount" readonly />
        </FormItem> -->

        <FormItem label="用户名" field="userName">
          <Input v-model="formData.userName" :disabled="!editing" placeholder="请输入用户名" />
        </FormItem>

        <FormItem label="个人简介" field="userProfile">
          <!-- <TextArea
            v-model="formData.userProfile"
            :disabled="!editing"
            placeholder="介绍一下自己吧"
            :auto-size="{ minRows: 3 }"
          /> -->
          <Input v-model="formData.userProfile" :disabled="!editing" placeholder="用户简介" />
        </FormItem>

        <div class="actions">
          <Button
            v-if="!editing"
            type="primary"
            @click="editing = true"
          >
            编辑信息
          </Button>
          
          <template v-else>
            <Button type="primary" :loading="loading" @click="handleSubmit">
              保存修改
            </Button>
            <Button type="outline" class="cancel-btn" @click="editing = false">
              取消
            </Button>
          </template>
        </div>
      </Form>
    </Card>
  </div>
</template>

<style scoped>
#userInfoView {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.user-info-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.avatar-section {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
}

.actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.cancel-btn {
  margin-left: 12px;
}
</style>