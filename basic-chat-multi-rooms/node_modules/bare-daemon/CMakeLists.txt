cmake_minimum_required(VERSION 3.31)

find_package(cmake-bare REQUIRED PATHS node_modules/cmake-bare)
find_package(cmake-fetch REQUIRED PATHS node_modules/cmake-fetch)
find_package(cmake-napi REQUIRED PATHS node_modules/cmake-napi)
find_package(cmake-npm REQUIRED PATHS node_modules/cmake-npm)

project(bare_daemon C)

fetch_package("github:holepunchto/libdaemon#09f985d")

add_bare_module(bare_daemon)

target_sources(
  ${bare_daemon}
  PRIVATE
    binding.c
)

target_link_libraries(
  ${bare_daemon}
  PRIVATE
    $<TARGET_OBJECTS:daemon>
  PUBLIC
    daemon
)

add_napi_module(bare_daemon_napi)

target_sources(
  ${bare_daemon_napi}
  PRIVATE
    binding.c
)

target_compile_definitions(
  ${bare_daemon_napi}
  PRIVATE
    NAPI_VERSION=9
)

target_link_libraries(
  ${bare_daemon_napi}
  PRIVATE
    $<TARGET_OBJECTS:daemon>
  PUBLIC
    daemon
)

resolve_node_module(bare-compat-napi compat)

target_include_directories(
  ${bare_daemon_napi}
  PRIVATE
    "${compat}/include"
)
