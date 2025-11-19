import messaging from '@react-native-firebase/messaging';
import firebase, { getApps } from '@react-native-firebase/app'; // 👈 getApps import 추가
import AsyncStorage from '@react-native-async-storage/async-storage';
import notifee, { AndroidImportance } from '@notifee/react-native';
import apiClient from '../api/axios';

class FCMService {
  private initialized = false;

  constructor() {
    // this.initializeNotifee(); // 생성자에서의 호출을 제거합니다.
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

  public async init() {
    // init 메소드 시작 부분에 Notifee 초기화 호출을 추가합니다.
    await this.initializeNotifee();

    console.log(' [FCM] Starting FCM initialization process...');
    // 👇 Deprecated 된 `firebase.apps.length` 대신 `getApps().length` 를 사용하도록 수정
    if (getApps().length === 0) {
      console.error('🔥 [FCM] Firebase app not initialized. FCM setup will not proceed.');
      return;
    }

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
    // 1. Foreground (앱이 켜져 있을 때)
    messaging().onMessage(async remoteMessage => {
      console.log('🔔 [FCM] <<< FOREGROUND MESSAGE RECEIVED >>>', JSON.stringify(remoteMessage, null, 2));
      await this.showLocalNotification(remoteMessage);
    });

    // 2. Background (앱이 백그라운드에 있을 때 알림을 '터치'한 경우)
    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('🔔 [FCM] Notification caused app to open from background state:', remoteMessage);
      // 예: 특정 화면으로 이동하는 로직을 여기에 추가할 수 있습니다.
      // navigation.navigate('Details', { itemId: remoteMessage.data.itemId });
    });

    // 3. Quit (앱이 완전히 꺼져있을 때 알림을 '터치'해서 실행된 경우)
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log('🔔 [FCM] Notification caused app to open from quit state:', remoteMessage);
          // 예: 앱 로딩 후 특정 화면으로 보내기 위한 초기 라우팅 정보를 저장할 수 있습니다.
        }
      });
    
    // 4. Background Message Handler (데이터 메시지 수신용)
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('🔔 [FCM] Background message handled:', remoteMessage);
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
      const { notification, data } = remoteMessage;

      // 이전 코드처럼 기본값을 설정하여 안정성 높임
      const title = notification?.title ?? '새로운 알림';
      const body = notification?.body ?? '새로운 메시지가 도착했습니다.';

      await notifee.displayNotification({
        title,
        body,
        data, // data 페이로드도 함께 전달
        android: {
          channelId: 'default',
          importance: AndroidImportance.HIGH,
          // 👇 이전 코드처럼 pressAction을 추가하여 알림 터치 시 앱이 열리도록 보장
          pressAction: {
            id: 'default',
          },
          smallIcon: 'ic_launcher',
        },
      });
      console.log('✅ [Notifee] Notification displayed successfully!');
    } catch (error) {
      console.error('❌ [Notifee] Error displaying notification:', error);
    }
  }

  // 로그인 후 또는 필요 시 외부에서 호출할 수 있는 함수
  async sendTokenToServer(token: string) {
    try {
      console.log(`📡 [FCM] Sending token to server...`);
      // 👇 API 경로를 백엔드에 맞게 수정합니다.
      await apiClient.post('/mobile', { fcmToken: token });
      console.log('📡 [FCM] ✅ Token successfully sent to server');
      return { success: true };
    } catch (error) {
      console.error('📡 [FCM] ❌ Failed to send token to server:', error);
      return { success: false, error };
    }
  }
}

export default new FCMService();
