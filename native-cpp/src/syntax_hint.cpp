#include "sourceclass_native.h"

#include <regex>
#include <sstream>

namespace sourceclass_native {

std::vector<SymbolHint> extract_basic_symbols(const std::string& text) {
  std::vector<SymbolHint> symbols;
  std::regex pattern(R"(^\s*(class|struct|enum|void|int|auto|double|float|string)\s+([A-Za-z_][A-Za-z0-9_]*))");
  std::istringstream stream(text);
  std::string line;
  std::size_t line_number = 1;

  while (std::getline(stream, line)) {
    std::smatch match;
    if (std::regex_search(line, match, pattern)) {
      symbols.push_back({line_number, match[1].str(), match[2].str()});
    }
    ++line_number;
  }

  return symbols;
}

std::vector<SplitPoint> detect_comment_regions(const std::string& text) {
  std::vector<SplitPoint> comments;
  std::istringstream stream(text);
  std::string line;
  std::size_t line_number = 1;
  bool in_block = false;

  while (std::getline(stream, line)) {
    const bool starts_line_comment = line.find("//") != std::string::npos;
    const bool starts_block = line.find("/*") != std::string::npos;
    const bool ends_block = line.find("*/") != std::string::npos;
    if (starts_line_comment || starts_block || in_block) {
      comments.push_back({line_number, in_block || starts_block ? "block_comment" : "line_comment"});
    }
    in_block = (in_block || starts_block) && !ends_block;
    ++line_number;
  }

  return comments;
}

}  // namespace sourceclass_native
