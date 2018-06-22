# This file is generated by gyp; do not edit.

TOOLSET := target
TARGET := epoll
DEFS_Debug := \
	'-DNODE_GYP_MODULE_NAME=epoll' \
	'-D_LARGEFILE_SOURCE' \
	'-D_FILE_OFFSET_BITS=64' \
	'-DBUILDING_NODE_EXTENSION' \
	'-DDEBUG' \
	'-D_DEBUG'

# Flags passed to all source files.
CFLAGS_Debug := \
	-fPIC \
	-pthread \
	-Wall \
	-Wextra \
	-Wno-unused-parameter \
	-Wno-unused-local-typedefs \
	-g \
	-O0

# Flags passed to only C files.
CFLAGS_C_Debug :=

# Flags passed to only C++ files.
CFLAGS_CC_Debug := \
	-fno-rtti \
	-fno-exceptions \
	-std=gnu++0x

INCS_Debug := \
	-I/home/pi/.node-gyp/5.12.0/include/node \
	-I/home/pi/.node-gyp/5.12.0/src \
	-I/home/pi/.node-gyp/5.12.0/deps/uv/include \
	-I/home/pi/.node-gyp/5.12.0/deps/v8/include \
	-I$(srcdir)/../nan

DEFS_Release := \
	'-DNODE_GYP_MODULE_NAME=epoll' \
	'-D_LARGEFILE_SOURCE' \
	'-D_FILE_OFFSET_BITS=64' \
	'-DBUILDING_NODE_EXTENSION'

# Flags passed to all source files.
CFLAGS_Release := \
	-fPIC \
	-pthread \
	-Wall \
	-Wextra \
	-Wno-unused-parameter \
	-Wno-unused-local-typedefs \
	-O3 \
	-fno-omit-frame-pointer

# Flags passed to only C files.
CFLAGS_C_Release :=

# Flags passed to only C++ files.
CFLAGS_CC_Release := \
	-fno-rtti \
	-fno-exceptions \
	-std=gnu++0x

INCS_Release := \
	-I/home/pi/.node-gyp/5.12.0/include/node \
	-I/home/pi/.node-gyp/5.12.0/src \
	-I/home/pi/.node-gyp/5.12.0/deps/uv/include \
	-I/home/pi/.node-gyp/5.12.0/deps/v8/include \
	-I$(srcdir)/../nan

OBJS := \
	$(obj).target/$(TARGET)/src/epoll.o

# Add to the list of files we specially track dependencies for.
all_deps += $(OBJS)

# CFLAGS et al overrides must be target-local.
# See "Target-specific Variable Values" in the GNU Make manual.
$(OBJS): TOOLSET := $(TOOLSET)
$(OBJS): GYP_CFLAGS := $(DEFS_$(BUILDTYPE)) $(INCS_$(BUILDTYPE))  $(CFLAGS_$(BUILDTYPE)) $(CFLAGS_C_$(BUILDTYPE))
$(OBJS): GYP_CXXFLAGS := $(DEFS_$(BUILDTYPE)) $(INCS_$(BUILDTYPE))  $(CFLAGS_$(BUILDTYPE)) $(CFLAGS_CC_$(BUILDTYPE))

# Suffix rules, putting all outputs into $(obj).

$(obj).$(TOOLSET)/$(TARGET)/%.o: $(srcdir)/%.cc FORCE_DO_CMD
	@$(call do_cmd,cxx,1)

# Try building from generated source, too.

$(obj).$(TOOLSET)/$(TARGET)/%.o: $(obj).$(TOOLSET)/%.cc FORCE_DO_CMD
	@$(call do_cmd,cxx,1)

$(obj).$(TOOLSET)/$(TARGET)/%.o: $(obj)/%.cc FORCE_DO_CMD
	@$(call do_cmd,cxx,1)

# End of this set of suffix rules
### Rules for final target.
LDFLAGS_Debug := \
	-pthread \
	-rdynamic

LDFLAGS_Release := \
	-pthread \
	-rdynamic

LIBS :=

$(obj).target/epoll.node: GYP_LDFLAGS := $(LDFLAGS_$(BUILDTYPE))
$(obj).target/epoll.node: LIBS := $(LIBS)
$(obj).target/epoll.node: TOOLSET := $(TOOLSET)
$(obj).target/epoll.node: $(OBJS) FORCE_DO_CMD
	$(call do_cmd,solink_module)

all_deps += $(obj).target/epoll.node
# Add target alias
.PHONY: epoll
epoll: $(builddir)/epoll.node

# Copy this to the executable output path.
$(builddir)/epoll.node: TOOLSET := $(TOOLSET)
$(builddir)/epoll.node: $(obj).target/epoll.node FORCE_DO_CMD
	$(call do_cmd,copy)

all_deps += $(builddir)/epoll.node
# Short alias for building this executable.
.PHONY: epoll.node
epoll.node: $(obj).target/epoll.node $(builddir)/epoll.node

# Add executable to "all" target.
.PHONY: all
all: $(builddir)/epoll.node

