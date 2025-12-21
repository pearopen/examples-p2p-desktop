#include <assert.h>
#include <bare.h>
#include <daemon.h>
#include <js.h>
#include <utf.h>

typedef utf8_t bare_daemon_path_t[4096 + 1 /* NULL */];

static js_value_t *
bare_daemon_spawn(js_env_t *env, js_callback_info_t *info) {
  int err;

  size_t argc = 4;
  js_value_t *argv[4];

  err = js_get_callback_info(env, info, &argc, argv, NULL, NULL);
  assert(err == 0);

  assert(argc == 4);

  uv_loop_t *loop;
  err = js_get_env_loop(env, &loop);
  assert(err == 0);

  bare_daemon_path_t file;
  err = js_get_value_string_utf8(env, argv[0], file, sizeof(bare_daemon_path_t), NULL);
  assert(err == 0);

  uint32_t args_len;
  err = js_get_array_length(env, argv[1], &args_len);
  assert(err == 0);

  utf8_t **args = calloc(1 /* file */ + args_len + 1 /* NULL */, sizeof(utf8_t *));

  args[0] = file;

  for (uint32_t i = 0; i < args_len; i++) {
    js_value_t *value;
    err = js_get_element(env, argv[1], i, &value);
    assert(err == 0);

    size_t arg_len;
    err = js_get_value_string_utf8(env, value, NULL, 0, &arg_len);
    assert(err == 0);

    arg_len += 1 /* NULL */;

    utf8_t *arg = malloc(arg_len);
    err = js_get_value_string_utf8(env, value, arg, arg_len, NULL);
    assert(err == 0);

    args[i + 1] = arg;
  }

  uint32_t pairs_len;
  err = js_get_array_length(env, argv[2], &pairs_len);
  assert(err == 0);

  utf8_t **pairs = calloc(pairs_len + 1 /* NULL */, sizeof(utf8_t *));

  for (uint32_t i = 0; i < pairs_len; i++) {
    js_value_t *value;
    err = js_get_element(env, argv[2], i, &value);
    assert(err == 0);

    size_t pair_len;
    err = js_get_value_string_utf8(env, value, NULL, 0, &pair_len);
    assert(err == 0);

    pair_len += 1 /* NULL */;

    utf8_t *pair = malloc(pair_len);
    err = js_get_value_string_utf8(env, value, pair, pair_len, NULL);
    assert(err == 0);

    pairs[i] = pair;
  }

  bare_daemon_path_t cwd;
  err = js_get_value_string_utf8(env, argv[3], cwd, sizeof(bare_daemon_path_t), NULL);
  assert(err == 0);

  daemon_t daemon;
  err = daemon_spawn(&daemon, (const char *) file, (const char **) args, (const char **) pairs, (const char *) cwd);

  for (uint32_t i = 0; i < args_len; i++) {
    free(args[i + 1]);
  }

  for (uint32_t i = 0; i < pairs_len; i++) {
    free(pairs[i]);
  }

  free(args);
  free(pairs);

  if (err < 0) {
    err = js_throw_error(env, NULL, "spawn() failed");
    assert(err == 0);

    return NULL;
  }

  js_value_t *result;
  err = js_create_int64(env, daemon.pid, &result);
  assert(err == 0);

  return result;
}

static js_value_t *
bare_daemon_exports(js_env_t *env, js_value_t *exports) {
  int err;

#define V(name, fn) \
  { \
    js_value_t *val; \
    err = js_create_function(env, name, -1, fn, NULL, &val); \
    assert(err == 0); \
    err = js_set_named_property(env, exports, name, val); \
    assert(err == 0); \
  }

  V("spawn", bare_daemon_spawn)
#undef V

  return exports;
}

BARE_MODULE(bare_daemon, bare_daemon_exports)
