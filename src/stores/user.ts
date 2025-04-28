import { ref} from 'vue'
import { defineStore } from 'pinia'
import {UserControllerService} from '@/api'
import ACCESS_ENUM from '@/access/accessEnum'
import {Message} from "@arco-design/web-vue";

export const useUserStore = defineStore('user', () => {
  const user = ref({
    userName:"",
    userRole:ACCESS_ENUM.NOT_LOGIN,
    userAvatar:"",
  })

  function changeUser(name:any,role:any,avatar:any){
    user.value.userName = name;
    user.value.userRole = role;
    user.value.userAvatar = avatar;
  }

  async function login() {
    const res = await UserControllerService.getLoginUserUsingGet();
    if(res.code === 0){
        changeUser(res.data?.userName,res.data?.userRole,res.data?.userAvatar);
    }else {
      reSet();
    }
  }
  function reSet(){
    user.value.userName = "";
    user.value.userRole = ACCESS_ENUM.NOT_LOGIN;
    user.value.userAvatar = "";
  }
  async function logout(){
    const res = await UserControllerService.userLogoutUsingPost();
    if(res.code === 0) {
      Message.success("登出成功");
    }reSet();
  }
  return { user,changeUser, login,logout}
},{
  persist: true,
},)
