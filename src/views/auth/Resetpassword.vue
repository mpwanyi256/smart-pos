<template>
    <div class="main-login">
        <div class="smart">
            <v-card class="auth_card">
                <v-card-text>
                    <template v-if="loading">
                        <div class="loading_spinner">
                            <LoadingSpinner class="large" />
                        </div>
                    </template>
                    <template v-else>
                        <template v-if="resend">
                            <div class="text-center mb-3">
                                <h3>Enter verification code we sent to your email</h3>
                            </div>
                            <div class="outlets-list mt-5">
                              <template v-if="!setNewPassword">
                                <BaseTextfield
                                  v-model.trim="code"
                                  placeholder="code"
                                />
                                <v-btn :disabled="code.length < 5"
                                  class="ml-4 mr-4" @click="verifyCode">
                                  Verify
                                </v-btn>
                              </template>
                              <template v-else>
                                <BaseTextfield
                                  v-model.trim="newPassword"
                                  placeholder="Enter new password"
                                  inputType="password"
                                />
                                <BaseTextfield
                                  v-model.trim="passwordConfirm"
                                  placeholder="Confirm password"
                                  inputType="password"
                                />
                                <v-btn :disabled="(newPassword.length < 6)
                                  || newPassword && newPassword !== passwordConfirm"
                                  class="ml-4 mr-4" @click="resetPassword">
                                  Reset password
                                </v-btn>
                              </template>
                            </div>
                            <div class="mt-4 text-right" v-if="!setNewPassword">
                                <p>Didn't get verification code ?
                                    <v-btn text small @click="resend = true">
                                      Resend code
                                    </v-btn>
                                </p>
                            </div>
                        </template>
                        <template v-else>
                            <div class="text-center mb-3">
                                <h3>Account recovery</h3>
                            </div>
                            <div class="text-center mb-3">
                                <p class="black--text">
                                  We will send you a reset code to your email address
                                </p>
                            </div>
                            <div class="resend-verification-code">
                                <BaseTextfield
                                    v-model.trim="companyEmailAddress"
                                    :preset="companyEmailAddress"
                                    placeholder="Enter email address"
                                />
                                <v-btn :disabled="!isValidEmail" class="ml-4 mr-4"
                                    @click="sendVerificationCode">
                                    Send
                                </v-btn>
                            </div>
                        </template>
                        <div class="login_link">
                            <p>Already have an account?&nbsp;
                                <span @click="switchToLogin">Signin</span></p>
                        </div>
                        <template v-if="errorMessage">
                            <p class="text-center red--text">{{ errorMessage }}</p>
                        </template>
                    </template>
                </v-card-text>
            </v-card>
        </div>
        <p class="prodev_info">
            <span>
            <v-avatar size="26">
                <img
                src="../../assets/logo.png"
                alt="uganda"
                >
            </v-avatar>
            </span>
            <a href="http://prodevgroup.22web.org/?i=2" target="__blank">
            Smart POS V-3.0.1
            </a>
            | Copyrite {{ new Date().getFullYear() }}
        </p>
    </div>
</template>
<script>
import BaseTextfield from '@/components/generics/BaseTextfield.vue';
import LoadingSpinner from '@/components/generics/LoadingSpinner.vue';
import validator from 'validator';
import { mapActions } from 'vuex';

export default {
  name: 'Resetpassword',

  components: {
    BaseTextfield,
    LoadingSpinner,
  },

  data() {
    return {
      code: '',
      companyEmailAddress: '',
      resend: false,
      errorMessage: '',
      setNewPassword: false,
      loading: false,
      userInfo: null,
      newPassword: '',
      passwordConfirm: '',
    };
  },

  watch: {
    errorMessage() {
      setTimeout(() => {
        this.errorMessage = '';
      }, 10000);
    },
  },

  computed: {
    isValidEmail() {
      return validator.isEmail(this.companyEmailAddress);
    },

    companyData() {
      return this.$route.params;
    },
  },

  mounted() {
    const { params } = this.$route;
    if (params.company_email) {
      this.companyEmailAddress = params.company_email;
    }
  },

  methods: {
    ...mapActions('auth', ['post']),
    ...mapActions('mail', ['sendEmail']),

    resetPassword() {
      this.loading = true;
      this.errorMessage = '';
      this.post({
        reset_password: this.newPassword.trim(),
        user_id: this.userInfo.company_id,
      })
        .then((res) => {
          this.errorMessage = res.message;
        })
        .finally(() => {
          this.loading = false;
        });
    },

    verifyCode() {
      this.loading = true;
      this.errorMessage = '';
      this.post({
        verify_code: this.code,
      })
        .then((res) => {
          if (!res.errorr) this.setNewPassword = true;
          else this.errorMessage = res.message;
        })
        .catch((e) => {
          this.errorMessage = e;
        })
        .finally(() => {
          this.loading = false;
        });
    },

    switchToLogin() {
      this.$router.replace({ name: 'login' });
    },

    sendVerificationCode() {
      this.loading = true;
      this.errorMessage = '';
      this.post({
        password_reset: this.companyEmailAddress,
      })
        // eslint-disable-next-line consistent-return
        .then((response) => {
          if (response.error || response.allow_login) {
            this.errorMessage = response.message;
          } else {
            const companyData = response.company_data;
            this.userInfo = companyData;
            return this.sendEmail({
              send_verification_code: true,
              ...companyData,
            });
          }
        })
        .then(() => {
          this.resend = true;
          this.errorMessage = 'Please enter verification code we sent to your email.';
        })
        .catch((e) => {
          console.log(e);
        })
        .finally(() => {
          this.loading = false;
        });
    },
  },
};
</script>
<style scoped lang="scss">
@import '../../styles/constants.scss';

.main-login {
    height: 100vh;
    width: 100vw;
    display: flex;
    flex-direction: column;
    background-size: 100%;
    background-repeat: no-repeat;
    display: flex;
    justify-content: center;
    align-items: center;
    background-image: url('../../assets/rocket.jpeg');

    .smart {
        height: calc(100vh - 56px);
        display: flex;
        gap: 15px;
        justify-content: center;
        align-items: center;

        .auth_card {
            width: 30vw !important;

            .loading_spinner {
                height: 300px;
                width: 100%;
                display: flex;
                justify-content: center;
                align-items: center;
            }

            .outlets-list, .resend-verification-code{
                height: auto;
                overflow-y: auto;
                overflow-x: hidden;
                display: grid;
                grid-template-columns: 70% 30%;
                width: 100%;
            }

            .login_link {
                width: 100%;
                margin-top: 15px;
                display: inline-flex;
                align-items: center;

                p {
                font-size: 14px;
                color: $black;
                text-align: center;
                width: 100%;
                line-height: 1.5;

                span {
                    color: $accent;
                    cursor: pointer;
                }
                }
            }
        }
    }

  .prodev_info {
    text-align: center;
    color: $white;
    font-weight: bold;

    a {
      text-decoration: none;
      color: inherit;
    }
  }
}
</style>
