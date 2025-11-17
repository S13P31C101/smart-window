import messaging from '@react-native-firebase/messaging';
import firebase from '@react-native-firebase/app';
import AsyncStorage from '@react-native-async-storage/async-storage';
import notifee, { AndroidImportance } from '@notifee/react-native';
import apiClient from '../api/axios';

class FCMService {
  private initialized = false;

  constructor() {
    this.initializeNotifee();
    this.initWhenReady();
  }

  private async initializeNotifee() {
    try {
      console.log('🔔 [FCM] Initializing Notifee...');
      await notifee.createChannel({
        id: 'default', // 수정: 채널 ID를 'default'로 단순화 (혹은 원하는 이름으로)
        name: 'Default Channel',
        importance: AndroidImportance.HIGH,
      });
      console.log('🔔 [FCM] Notifee channel created');
    } catch (error) {
      console.error('🔔 [FCM] Error initializing Notifee:', error);
    }
  }

  private async initWhenReady() {
    console.log('🔥 [FCM] Starting FCM initialization process...');
    if (firebase.apps.length > 0) {
      console.log('🔥 [FCM] Firebase app detected. Initializing...');
      await this.init();
    } else {
      console.error('🔥 [FCM] Firebase app not initialized. FCM setup will not proceed.');
    }
  }

  private async init() {
    if (this.initialized) {
      console.log('🔥 [FCM] Already initialized, skipping');
      return;
    }

    try {
      console.log('🔥 [FCM] Requesting permission...');
      const permissionGranted = await this.requestPermission();
      if (!permissionGranted) {
        console.log('🔥 [FCM] Notification permission not granted. Halting token setup.');
        return;
      }
      
      console.log('🔥 [FCM] Getting FCM token...');
      await this.getTokenAndSendToServer();

      console.log('🔥 [FCM] Setting up message handlers...');
      this.setupMessageHandlers();
      
      console.log('🔥 [FCM] Setting up token refresh handler...');
      this.setupTokenRefreshHandler();
      
      this.initialized = true;
      console.log('🔥 [FCM] ✅ All initialization steps completed successfully!');
    } catch (error) {
      console.error('🔥 [FCM] ❌ Initialization failed:', error);
    }
  }

  private async requestPermission() {
    try {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('🔥 [FCM] ✅ Notification permission granted!');
      } else {
        console.log('🔥 [FCM] ❌ Notification permission denied.');
      }
      return enabled;
    } catch (error) {
      console.error('🔥 [FCM] ❌ Permission request error:', error);
      return false;
    }
  }

  private async getTokenAndSendToServer() {
    try {
      const token = await messaging().getToken();
      if (token) {
        console.log('🔥 [FCM] Token obtained:', token);
        await AsyncStorage.setItem('fcmToken', token);
        // 로그인 상태일 경우에만 서버로 토큰 전송 (필요 시 로직 수정)
        // 예: const isLoggedIn = useAuthStore.getState().isLoggedIn;
        // if (isLoggedIn) {
        //   await this.sendTokenToServer(token);
        // }
        return token;
      } else {
        console.log('🔥 [FCM] ⚠️ FCM Token is empty or null');
        return null;
      }
    } catch (error) {
      console.error('🔥 [FCM] ❌ Get token error:', error);
      return null;
    }
  }

  private setupMessageHandlers() {
    // Foreground
    messaging().onMessage(async remoteMessage => {
      console.log('🔔 [FCM] Foreground message received:', remoteMessage);
      await this.showLocalNotification(remoteMessage);
    });

    // Background
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('🔔 [FCM] Background message received:', remoteMessage);
    });
  }

  private setupTokenRefreshHandler() {
    messaging().onTokenRefresh(async newToken => {
      console.log('🔥 [FCM] Token refreshed:', newToken);
      await AsyncStorage.setItem('fcmToken', newToken);
      await this.sendTokenToServer(newToken);
    });
  }

  private async showLocalNotification(remoteMessage: any) {
    try {
      const { notification } = remoteMessage;
      if (!notification) return;

      await notifee.displayNotification({
        title: notification.title,
        body: notification.body,
        android: {
          channelId: 'default',
          importance: AndroidImportance.HIGH,
          smallIcon: 'ic_launcher', // TODO: 안드로이드 알림 아이콘 확인
        },
      });
      console.log('🔔 [FCM] Local notification displayed');
    } catch (error) {
      console.error('🔔 [FCM] Error showing local notification:', error);
    }
  }

  // 로그인 후 또는 필요 시 외부에서 호출할 수 있는 함수
  async sendTokenToServer(token: string) {
    try {
      console.log(`📡 [FCM] Sending token to server...`);
      await apiClient.post('/devices/fcm', { fcmToken: token }); // 수정: API 엔드포인트 및 payload
      console.log('📡 [FCM] ✅ Token successfully sent to server');
      return { success: true };
    } catch (error) {
      console.error('📡 [FCM] ❌ Failed to send token to server:', error);
      return { success: false, error };
    }
  }
}

export default new FCMService();
