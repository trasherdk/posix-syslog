#include <napi.h>
#include <string.h>
#include <syslog.h>

// openlog() first argument (const char* ident) is not guaranteed to be
// copied within the openlog() call so we need to keep it in a safe location
static const size_t MAX_SYSLOG_IDENT=100;
static char syslog_ident[MAX_SYSLOG_IDENT+1] = {0};

Napi::Value node_openlog(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if (info.Length() != 3) {
        Napi::Error::New(env, "openlog: requires exactly 3 arguments").ThrowAsJavaScriptException();
        return env.Null();
    }

    std::string ident_str = info[0].As<Napi::String>();
    const char *ident = ident_str.data();
    strncpy(syslog_ident, ident, MAX_SYSLOG_IDENT);
    syslog_ident[MAX_SYSLOG_IDENT] = 0;
    if (!info[1].IsNumber() || !info[2].IsNumber()) {
        Napi::Error::New(env, "openlog: invalid argument values").ThrowAsJavaScriptException();
        return env.Null();
    }
    openlog(syslog_ident, info[1].ToNumber().Int32Value(), info[2].ToNumber().Int32Value());

    return env.Undefined();
}

Napi::Value node_closelog(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if (info.Length() != 0) {
        Napi::Error::New(env, "closelog: does not take any arguments").ThrowAsJavaScriptException();
        return env.Null();
    }

    closelog();

    return env.Undefined();
}

Napi::Value node_syslog(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if (info.Length() != 2) {
        Napi::Error::New(env, "syslog: requires exactly 2 arguments").ThrowAsJavaScriptException();
        return env.Null();
    }

    std::string message_str = info[1].As<Napi::String>();
    const char *message = message_str.data();
    syslog(info[0].ToNumber().Int32Value(), "%s", message);

    return env.Undefined();
}

Napi::Value node_setlogmask(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if (info.Length() != 1) {
        Napi::Error::New(env, "setlogmask: takes exactly 1 argument").ThrowAsJavaScriptException();
        return env.Null();
    }

    return Napi::Number::New(env, setlogmask(info[0].ToNumber().Int32Value()));
}

#define ADD_MASK_FLAG(name, flag) \
    (obj).Set(Napi::String::New(env, name), Napi::Number::New(env, flag)); \
    (obj).Set(Napi::String::New(env, "mask_" name), Napi::Number::New(env, LOG_MASK(flag)));

Napi::Value node_update_syslog_constants(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if (info.Length() != 1) {
      Napi::Error::New(env, "update_syslog_constants: takes exactly 1 argument").ThrowAsJavaScriptException();
      return env.Null();
    }

    if (!info[0].IsObject()) {
        Napi::TypeError::New(env, "update_syslog_constants: argument must be an object").ThrowAsJavaScriptException();
        return env.Null();
    }

    Napi::Object obj = info[0].As<Napi::Object>();

    // priority constants + their LOG_MASK() values
    ADD_MASK_FLAG("emerg", LOG_EMERG);
    ADD_MASK_FLAG("alert", LOG_ALERT);
    ADD_MASK_FLAG("crit", LOG_CRIT);
    ADD_MASK_FLAG("err", LOG_ERR);
    ADD_MASK_FLAG("warning", LOG_WARNING);
    ADD_MASK_FLAG("notice", LOG_NOTICE);
    ADD_MASK_FLAG("info", LOG_INFO);
    ADD_MASK_FLAG("debug", LOG_DEBUG);

    // facility constants
    (obj).Set(Napi::String::New(env, "auth"), Napi::Number::New(env, LOG_AUTH));
#ifdef LOG_AUTHPRIV
    (obj).Set(Napi::String::New(env, "authpriv"), Napi::Number::New(env, LOG_AUTHPRIV));
#endif
    (obj).Set(Napi::String::New(env, "cron"), Napi::Number::New(env, LOG_CRON));
    (obj).Set(Napi::String::New(env, "daemon"), Napi::Number::New(env, LOG_DAEMON));
#ifdef LOG_FTP
    (obj).Set(Napi::String::New(env, "ftp"), Napi::Number::New(env, LOG_FTP));
#endif
    (obj).Set(Napi::String::New(env, "kern"), Napi::Number::New(env, LOG_KERN));
    (obj).Set(Napi::String::New(env, "lpr"), Napi::Number::New(env, LOG_LPR));
    (obj).Set(Napi::String::New(env, "mail"), Napi::Number::New(env, LOG_MAIL));
    (obj).Set(Napi::String::New(env, "news"), Napi::Number::New(env, LOG_NEWS));
    (obj).Set(Napi::String::New(env, "syslog"), Napi::Number::New(env, LOG_SYSLOG));
    (obj).Set(Napi::String::New(env, "user"), Napi::Number::New(env, LOG_USER));
    (obj).Set(Napi::String::New(env, "uucp"), Napi::Number::New(env, LOG_UUCP));
    (obj).Set(Napi::String::New(env, "local0"), Napi::Number::New(env, LOG_LOCAL0));
    (obj).Set(Napi::String::New(env, "local1"), Napi::Number::New(env, LOG_LOCAL1));
    (obj).Set(Napi::String::New(env, "local2"), Napi::Number::New(env, LOG_LOCAL2));
    (obj).Set(Napi::String::New(env, "local3"), Napi::Number::New(env, LOG_LOCAL3));
    (obj).Set(Napi::String::New(env, "local4"), Napi::Number::New(env, LOG_LOCAL4));
    (obj).Set(Napi::String::New(env, "local5"), Napi::Number::New(env, LOG_LOCAL5));
    (obj).Set(Napi::String::New(env, "local6"), Napi::Number::New(env, LOG_LOCAL6));
    (obj).Set(Napi::String::New(env, "local7"), Napi::Number::New(env, LOG_LOCAL7));

    // option constants
    (obj).Set(Napi::String::New(env, "pid"), Napi::Number::New(env, LOG_PID));
    (obj).Set(Napi::String::New(env, "cons"), Napi::Number::New(env, LOG_CONS));
    (obj).Set(Napi::String::New(env, "ndelay"), Napi::Number::New(env, LOG_NDELAY));
    (obj).Set(Napi::String::New(env, "odelay"), Napi::Number::New(env, LOG_ODELAY));
    (obj).Set(Napi::String::New(env, "nowait"), Napi::Number::New(env, LOG_NOWAIT));

    return env.Undefined();
}

Napi::Object init(Napi::Env env, Napi::Object exports) {
    exports.Set("openlog", Napi::Function::New(env, node_openlog));
    exports.Set("closelog", Napi::Function::New(env, node_closelog));
    exports.Set("syslog", Napi::Function::New(env, node_syslog));
    exports.Set("setlogmask", Napi::Function::New(env, node_setlogmask));
    exports.Set("update_syslog_constants", Napi::Function::New(env, node_update_syslog_constants));
    return exports;
}

NODE_API_MODULE(syslog, init);
