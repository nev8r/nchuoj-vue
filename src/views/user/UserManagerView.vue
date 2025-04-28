<script setup lang="ts">
import { Message } from '@arco-design/web-vue';
import { UserControllerService, type UserQueryRequest, type UserUpdateRequest, type User, type DeleteRequest } from '@/api';
import { onMounted, ref, watchEffect } from 'vue';
import { reactive } from 'vue';
import type { IconLeft } from '@arco-design/web-vue/es/icon';

const total = ref<number>(0);
const dataList = ref<User[]>([]);
const searchParams = ref({
  userName: '',
  userRole: '',
  pageSize: 5,
  current: 1,
})

/**
 * 加载表格数据
 */
const loadData = async () => {
  const res = await UserControllerService.listUserByPageUsingPost(searchParams.value);
  if (res.code == 0) {
    dataList.value = res.data.records as User[];
    total.value = res.data.total;
  } else {
    Message.error("加载数据错误," + res.message);
  }
}

watchEffect(() => {
  loadData();
});

onMounted(() => {
  loadData();
});

// 删除用户确认对话框
const deleteVisible = ref(false);
const userToDelete = ref<User | null>(null);

const showDeleteConfirm = (user: User) => {
  userToDelete.value = user;
  deleteVisible.value = true;
}

const doDelete = async () => {
  if (!userToDelete.value || !userToDelete.value.id) {
    Message.error("用户ID不能为空");
    return;
  }
  
  const deleteRequest: DeleteRequest = {
    id: userToDelete.value.id
  };
  
  const res = await UserControllerService.deleteUserUsingPost(deleteRequest);
  if (res.code == 0) {
    Message.success("删除成功");
    loadData();
  } else {
    Message.error("删除失败," + res.message);
  }
  deleteVisible.value = false;
  userToDelete.value = null;
}

const cancelDelete = () => {
  deleteVisible.value = false;
  userToDelete.value = null;
}

const onPageChange = (page: number) => {
  searchParams.value = {
    ...searchParams.value,
    current: page,
  }
}

const columns = [
  {
    title: '用户名',
    dataIndex: 'userName',
  },
  {
    title: '用户角色',
    dataIndex: 'userRole',
  },
  {
    title: '用户头像',
    slotName: 'avatar',
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
  },
  {
    title: '更新时间',
    dataIndex: 'updateTime',
  },
  {
    title: '操作',
    slotName: 'optional'
  },
];

const visible = ref(false);
const statusChange = ref(2); // 默认为编辑模式
const form = reactive<UserUpdateRequest>({
  id: undefined,
  userName: '',
  userAvatar: '',
  userRole: '',
});

// 头像预览
const avatarPreview = ref('');

// 监听头像URL变化预览
const updateAvatarPreview = () => {
  avatarPreview.value = form.userAvatar || '';
};

const handleOk = async () => {
  const res = await UserControllerService.updateUserUsingPost(form);
  if (res.code == 0) {
    Message.success("修改成功");
  } else {
    Message.error("修改失败," + res.message);
  }
  loadData();
  visible.value = false;
};

const doEdit = (user: User) => {
  form.id = user.id;
  form.userName = user.userName;
  form.userAvatar = user.userAvatar;
  form.userRole = user.userRole;
  avatarPreview.value = user.userAvatar || '';
  statusChange.value = 2;
  visible.value = true;
}

const rules = {
  userName: [
    {
      required: true,
      message: '未填写用户名',
    },
  ],
  userRole: [
    {
      required: true,
      message: '未填写用户角色',
    },
  ],
}

/**
 * 确认提交，重载数据
 */
const handleSubmit = () => {
  searchParams.value = {
    ...searchParams.value,
    current: 1,
  }
};

// 用户角色选项
const userRoleOptions = [
  {
    label: '普通用户',
    value: 'user',
  },
  {
    label: '管理员',
    value: 'admin',
  },
];

// 处理头像显示错误
const handleAvatarError = () => {
  // 设置默认头像
  return '/path/to/default-avatar.png';
}
</script>

<template>
  <div id="manageUser">
    <a-form :model="searchParams" layout="inline" @submit="handleSubmit">
      <a-form-item field="userName" label="用户名">
        <a-input v-model="searchParams.userName" placeholder="请输入用户名" style="min-width: 240px;" />
      </a-form-item>
      <a-form-item field="userRole" label="用户角色">
        <a-select v-model="searchParams.userRole" placeholder="请选择用户角色" style="min-width: 240px;">
          <a-option value="">全部</a-option>
          <a-option value="user">普通用户</a-option>
          <a-option value="admin">管理员</a-option>
        </a-select>
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit">搜索</a-button>
      </a-form-item>
    </a-form>
    <a-divider :size="0" />

    <a-table style="margin-top: 30px" :columns="columns" :data="dataList" @page-change="onPageChange" :pagination="{
      showTotal: true,
      pageSize: searchParams.pageSize,
      current: searchParams.current,
      total: parseInt(String(total), 10)
    }">
      <!-- 头像图片显示 -->
      <template #avatar="{ record }">
        <a-avatar
          :imageUrl="record.userAvatar || ''"
          :style="{ backgroundColor: '#165DFF' }"
        >
          <template #content>
            <div class="avatar-preview">
              <img :src="record.userAvatar || '/path/to/default-avatar.png'" alt="用户头像" />
            </div>
          </template>
          <!-- 如果没有头像，显示用户名首字母 -->
          <!-- <template #trigger-icon>
            <span>{{ record.userName ? record.userName.charAt(0).toUpperCase() : 'U' }}</span>
          </template> -->
        </a-avatar>
      </template>
      <template #optional="{ record }">
        <a-space>
          <a-button type="primary" @click="doEdit(record)">修改</a-button>
          <a-button type="primary" status="danger" @click="showDeleteConfirm(record)">删除</a-button>
        </a-space>
      </template>
    </a-table>

    <!-- 编辑用户抽屉 -->
    <a-drawer :width="500" v-model:visible="visible">
      <template #title>
        <div>修改用户</div>
      </template>
      <!-- 照片居中 -->
      <a-avatar 
            :imageUrl="avatarPreview" 
            :size="64" 
        >
                <!-- <template #trigger-icon>
                  <span>{{ form.userName ? form.userName.charAt(0).toUpperCase() : 'U' }}</span>
                </template> -->
    </a-avatar>
      <a-form :model="form" :style="{ width: '400px' }" :rules="rules" @submit-success="handleOk">
        <a-form-item field="userName" label="用户名">
          <a-input v-model="form.userName" placeholder="请输入用户名" />
        </a-form-item>
        <a-form-item field="userAvatar" label="用户头像">
          <div class="avatar-input-container">
            <a-input v-model="form.userAvatar" placeholder="请输入头像URL" @input="updateAvatarPreview" />
            <div class="avatar-preview-container" v-if="avatarPreview">
            </div>
          </div>
        </a-form-item>
        <a-form-item field="userRole" label="用户角色">
          <a-select v-model="form.userRole" placeholder="请选择用户角色">
            <a-option v-for="option in userRoleOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </a-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" html-type="submit" :style="{ width: '200px' }">提交</a-button>
        </a-form-item>
      </a-form>
      <template #footer>
        <div></div>
      </template>
    </a-drawer>

    <!-- 删除确认对话框 -->
    <a-modal
      v-model:visible="deleteVisible"
      @ok="doDelete"
      @cancel="cancelDelete"
      okText="确认"
      cancelText="取消"
      title="确认删除"
    >
      <p>确定要删除用户 "{{ userToDelete?.userName }}" 吗？此操作不可恢复。</p>
    </a-modal>
  </div>
</template>

<style>
#manageUser {
  min-width: 1280px;
  margin: 0 auto;
}

.avatar-input-container {
  display: flex;
  align-items: center;
  gap: 16px;
}

.avatar-preview-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.avatar-preview {
  width: 200px;
  height: 200px;
  background-color: #f2f3f5;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.avatar-preview img {
  max-width: 100%;
  max-height: 100%;
  object-fit: cover;
}
</style>