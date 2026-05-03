cmake_minimum_required(VERSION 3.20)
project(sourceclass_native LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

add_library(sourceclass_native STATIC
  src/tokenizer.cpp
  src/large_file_preprocessor.cpp
  src/syntax_hint.cpp
)

target_include_directories(sourceclass_native PUBLIC include)

add_executable(sourceclass_native_smoke
  src/tokenizer.cpp
  src/large_file_preprocessor.cpp
  src/syntax_hint.cpp
)

target_compile_definitions(sourceclass_native_smoke PRIVATE SOURCECLASS_NATIVE_SMOKE=1)
target_include_directories(sourceclass_native_smoke PRIVATE include)
