import { useEffect, useState } from 'react';
import { IconDelete, IconSaveStroked, IconSettingStroked } from '@douyinfe/semi-icons';
import { Button, Input, Modal, Select, Toast } from '@douyinfe/semi-ui';
import type { SelectValue } from '@douyinfe/semi-ui/lib/es/select';
import dayjs from 'dayjs';
import type { VegetableCategory } from '../types/vegetable';
import type { TrendFilter } from '../utils/price';
import {
  deleteFilterPreset,
  getFilterPresets,
  isPresetNameExists,
  saveFilterPreset,
} from '../utils/filterPreset';
import type { FilterPreset } from '../utils/filterPreset';

export interface FilterPresetSelectorProps {
  keyword: string;
  category: VegetableCategory | '';
  trendFilter: TrendFilter;
  minPrice: number | undefined;
  maxPrice: number | undefined;
  onLoadPreset: (preset: FilterPreset) => void;
}

export function FilterPresetSelector(props: FilterPresetSelectorProps) {
  const { keyword, category, trendFilter, minPrice, maxPrice, onLoadPreset } = props;

  const [presets, setPresets] = useState<FilterPreset[]>([]);
  const [selectedPresetId, setSelectedPresetId] = useState<string | undefined>(undefined);
  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);

  const refreshPresets = () => {
    setPresets(getFilterPresets());
  };

  useEffect(() => {
    refreshPresets();
    const handleStorage = () => refreshPresets();
    const handleFocus = () => refreshPresets();
    window.addEventListener('storage', handleStorage);
    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const handleOpenSaveModal = () => {
    setPresetName('');
    setNameError(null);
    setSaveModalVisible(true);
  };

  const handleSavePreset = () => {
    const trimmedName = presetName.trim();
    if (!trimmedName) {
      setNameError('方案名称不能为空');
      return;
    }
    if (isPresetNameExists(trimmedName)) {
      Modal.confirm({
        title: '方案名称已存在',
        content: `是否覆盖已有的「${trimmedName}」方案？`,
        okText: '覆盖',
        cancelText: '取消',
        onOk: () => {
          doSavePreset(trimmedName);
        },
      });
      return;
    }
    doSavePreset(trimmedName);
  };

  const doSavePreset = (name: string) => {
    saveFilterPreset({
      name,
      keyword,
      category,
      trendFilter,
      minPrice,
      maxPrice,
    });
    refreshPresets();
    setSaveModalVisible(false);
    Toast.success(`方案「${name}」已保存`);
  };

  const handleSelectPreset = (value: SelectValue) => {
    if (!value || typeof value !== 'string') {
      setSelectedPresetId(undefined);
      return;
    }
    const preset = presets.find((p) => p.id === value);
    if (preset) {
      setSelectedPresetId(value);
      onLoadPreset(preset);
      Toast.success(`已加载方案「${preset.name}」`);
    }
  };

  const handleDeletePreset = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const preset = presets.find((p) => p.id === id);
    if (!preset) return;
    Modal.confirm({
      title: '删除方案',
      content: `确定要删除方案「${preset.name}」吗？`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => {
        deleteFilterPreset(id);
        refreshPresets();
        if (selectedPresetId === id) {
          setSelectedPresetId(undefined);
        }
        Toast.success('方案已删除');
      },
    });
  };

  const presetOptions = presets.map((preset) => ({
    label: (
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          gap: 12,
        }}
      >
        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {preset.name}
        </span>
        <span
          style={{
            color: 'var(--semi-color-text-3)',
            fontSize: 12,
            flexShrink: 0,
          }}
        >
          {dayjs(preset.createdAt).format('MM-DD HH:mm')}
        </span>
        <button
          className="preset-delete-btn"
          onClick={(e) => handleDeletePreset(preset.id, e)}
          title={`删除「${preset.name}」`}
          style={{
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            padding: 2,
            borderRadius: 4,
            color: 'var(--semi-color-text-2)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--semi-color-danger)';
            (e.currentTarget as HTMLButtonElement).style.background = 'var(--semi-color-danger-light-1)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--semi-color-text-2)';
            (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
          }}
        >
          <IconDelete size="small" />
        </button>
      </div>
    ),
    value: preset.id,
    showTick: true,
  }));

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <Button
        icon={<IconSaveStroked />}
        onClick={handleOpenSaveModal}
      >
        保存当前方案
      </Button>
      <Select
        placeholder="加载方案"
        value={selectedPresetId}
        onChange={handleSelectPreset}
        optionList={presetOptions}
        style={{ width: 220 }}
        emptyContent={
          <span style={{ color: 'var(--semi-color-text-3)', fontSize: 12 }}>暂无保存的方案</span>
        }
        renderSelectedItem={(option: { value?: string } | undefined) => {
          const preset = presets.find((p) => p.id === option?.value);
          if (!preset) return '加载方案';
          return (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <IconSettingStroked />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 150 }}>
                {preset.name}
              </span>
            </span>
          );
        }}
        dropdownMargin={4}
        dropdownClassName="preset-select-dropdown"
      />

      <Modal
        title="保存筛选方案"
        visible={saveModalVisible}
        onOk={handleSavePreset}
        onCancel={() => setSaveModalVisible(false)}
        okText="保存"
        cancelText="取消"
        maskClosable={false}
        afterClose={() => {
          setPresetName('');
          setNameError(null);
        }}
      >
        <div style={{ marginBottom: 16 }}>
          <span style={{ fontSize: 13, color: 'var(--semi-color-text-2)' }}>将保存以下筛选条件：</span>
          <div
            style={{
              marginTop: 8,
              padding: 12,
              background: 'var(--semi-color-fill-0)',
              borderRadius: 6,
              fontSize: 13,
              lineHeight: 1.8,
            }}
          >
            <div>
              <span style={{ color: 'var(--semi-color-text-2)' }}>关键词：</span>
              <span>{keyword.trim() || '（无）'}</span>
            </div>
            <div>
              <span style={{ color: 'var(--semi-color-text-2)' }}>品类：</span>
              <span>{category || '全部'}</span>
            </div>
            <div>
              <span style={{ color: 'var(--semi-color-text-2)' }}>涨跌方向：</span>
              <span>
                {trendFilter === 'all' ? '全部' : trendFilter === 'up' ? '只看涨价' : '只看降价'}
              </span>
            </div>
            <div>
              <span style={{ color: 'var(--semi-color-text-2)' }}>价格区间：</span>
              <span>
                {minPrice === undefined && maxPrice === undefined
                  ? '不限'
                  : `${minPrice === undefined ? '不限' : `≥ ${minPrice.toFixed(2)}`} ~ ${
                      maxPrice === undefined ? '不限' : `≤ ${maxPrice.toFixed(2)}`
                    }`}
              </span>
            </div>
          </div>
        </div>
        <div>
          <div style={{ fontSize: 14, marginBottom: 6, color: 'var(--semi-color-text-1)' }}>
            方案名称
          </div>
          <Input
            placeholder="请输入方案名称，例如：叶菜涨价方案"
            value={presetName}
            onChange={(v) => {
              setPresetName(v);
              if (nameError) setNameError(null);
            }}
            validateStatus={nameError ? 'error' : undefined}
            autoFocus
            maxLength={30}
            showClear
          />
          <div
            style={{
              marginTop: 6,
              fontSize: 12,
              color: nameError ? 'var(--semi-color-danger)' : 'var(--semi-color-text-2)',
            }}
          >
            {nameError || '名称将用于区分不同的筛选方案'}
          </div>
        </div>
      </Modal>

      <style>{`
        .preset-select-dropdown .semi-select-option {
          position: relative;
        }
        .preset-select-dropdown .semi-select-option:hover .preset-delete-btn {
          opacity: 1;
        }
      `}</style>
    </div>
  );
}
